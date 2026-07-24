import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }, roles?: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("id", ctx.userId)
    .maybeSingle();

  if (error || !data) throw new Error("Forbidden: Not an administrator account");
  if (roles && !roles.includes(data.role) && data.role !== "super_admin") {
    throw new Error(`Forbidden: Insufficient privileges (${data.role})`);
  }
  return data.role as string;
}

export const listPendingRegistrations = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, ["admissions_officer", "academic_officer"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("pending_registrations")
      .select(
        `
        id, full_name, email, phone, level, status, rejection_reason, created_at, assigned_matric,
        faculty:faculties(name),
        department:departments(name)
      `,
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listEnrolledStudents = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, ["admissions_officer", "academic_officer"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("students")
      .select(
        `
        id, matric_number, full_name, email, phone, level, status, created_at,
        faculty:faculties(name),
        department:departments(name)
      `,
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const approveRegistration = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        matricNumber: z
          .string()
          .regex(/^\d{6}0209$/)
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context, ["admissions_officer", "academic_officer"]);
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;

    const { data: pending, error: pErr } = await supabaseAdmin
      .from("pending_registrations")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (pErr || !pending) throw new Error("Registration record not found");
    if (pending.status !== "pending") throw new Error(`Registration is already ${pending.status}`);

    // Determine Matric Number
    let matric = data.matricNumber;
    if (matric) {
      const { data: dupe } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("matric_number", matric)
        .maybeSingle();
      if (dupe) throw new Error("Matric number already assigned to another student");
    } else {
      const { data: gen, error: gErr } = await supabaseAdmin.rpc("generate_matric_number");
      if (!gErr && gen) {
        matric = gen as string;
      } else {
        const rand = Math.floor(100000 + Math.random() * 900000);
        matric = `${rand}0209`;
      }
    }

    if (!pending.password_hash) {
      throw new Error("Registration has no password hash.");
    }

    let authUserId: string;

    // Try creating Auth User
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: pending.email,
      email_confirm: true,
      password_hash: pending.password_hash,
      user_metadata: { full_name: pending.full_name, matric_number: matric },
    });

    if (cErr) {
      // If user already exists in Supabase Auth, retrieve existing user
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersList?.users?.find(
        (u: any) => u.email?.toLowerCase() === pending.email.toLowerCase(),
      );
      if (existingUser) {
        authUserId = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password_hash: pending.password_hash,
          user_metadata: { full_name: pending.full_name, matric_number: matric },
        });
      } else {
        throw new Error(cErr.message ?? "Failed to create user in Auth system");
      }
    } else if (created?.user) {
      authUserId = created.user.id;
    } else {
      throw new Error("Failed to provision student Auth account");
    }

    // Upsert into students table
    const { error: sErr } = await supabaseAdmin.from("students").upsert({
      id: authUserId,
      matric_number: matric,
      full_name: pending.full_name,
      email: pending.email,
      phone: pending.phone,
      faculty_id: pending.faculty_id,
      department_id: pending.department_id,
      level: pending.level,
      status: "active",
    });

    if (sErr) throw new Error(`Database error creating student: ${sErr.message}`);

    // Update pending_registrations table
    const { error: upErr } = await supabaseAdmin
      .from("pending_registrations")
      .update({
        status: "approved",
        assigned_matric: matric,
        processed_at: new Date().toISOString(),
      })
      .eq("id", pending.id);

    if (upErr) throw new Error(upErr.message);

    // Record notification in database
    await supabaseAdmin.from("notifications").insert({
      user_id: authUserId,
      title: "Admission Approved & Matriculation Number Assigned",
      body: `Congratulations ${pending.full_name}! Your application has been approved. Your assigned Matriculation Number is ${matric}. You can now sign in to the Student Portal using your Matric Number and password.`,
      read: false,
    });

    // Dispatch Email Notification to Student
    const { sendAdmissionApprovalEmail } = await import("@/lib/email.service");
    const emailRes = await sendAdmissionApprovalEmail({
      email: pending.email,
      fullName: pending.full_name,
      matricNumber: matric,
    });

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "approve_registration",
      target: pending.id,
      metadata: {
        matric_number: matric,
        email: pending.email,
        email_sent: emailRes.success,
        message_id: emailRes.messageId ?? null,
      },
    });

    return {
      ok: true,
      matricNumber: matric,
      emailSent: emailRes.success,
      emailMessage: emailRes.success
        ? "Email sent successfully"
        : "Recorded in portal notifications",
    };
  });

export const rejectRegistration = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        reason: z.string().trim().min(3).max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context, ["admissions_officer", "academic_officer"]);
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;

    const reason =
      data.reason ??
      "Your registration contains inappropriate or incorrect information. Please review your details and register again with accurate information.";

    const { data: pending, error: pErr } = await supabaseAdmin
      .from("pending_registrations")
      .select("id, full_name, email, status")
      .eq("id", data.id)
      .maybeSingle();

    if (pErr || !pending) throw new Error("Registration record not found");
    if (pending.status !== "pending") throw new Error(`Registration is already ${pending.status}`);

    const { error: upErr } = await supabaseAdmin
      .from("pending_registrations")
      .update({
        status: "rejected",
        rejection_reason: reason,
        processed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (upErr) throw new Error(upErr.message);

    // Record notification in database
    await supabaseAdmin.from("notifications").insert({
      title: "Application Status Update: Declined",
      body: `Your application for ${pending.full_name} (${pending.email}) was declined. Reason: ${reason}`,
      read: false,
    });

    // Dispatch Email Notification
    const { sendAdmissionRejectionEmail } = await import("@/lib/email.service");
    const emailRes = await sendAdmissionRejectionEmail({
      email: pending.email,
      fullName: pending.full_name || "Applicant",
      reason,
    });

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      action: "reject_registration",
      target: data.id,
      metadata: { reason, email: pending.email, email_sent: emailRes.success },
    });

    return { ok: true, emailSent: emailRes.success };
  });
