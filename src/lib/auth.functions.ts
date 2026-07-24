import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { FALLBACK_DEPARTMENTS, FALLBACK_FACULTIES } from "@/lib/reference.functions";

const LOCKOUT_MAX = 5;
const LOCKOUT_MINUTES = 15;

const REQUIRED_ADMINS = [
  {
    username: "asuadmin",
    email: "asuadmin@asu.edu.ng",
    password: "Analytical@admin",
    role: "super_admin" as const,
    fullName: "System Administrator",
  },
  {
    username: "asuregistrar",
    email: "asuregistrar@asu.edu.ng",
    password: "Registrar@12345",
    role: "admissions_officer" as const,
    fullName: "Admissions Registrar",
  },
  {
    username: "asuacademic",
    email: "asuacademic@asu.edu.ng",
    password: "Academic@12345",
    role: "academic_officer" as const,
    fullName: "Academic Officer",
  },
];

async function ensureAdminAccounts(supabaseAdmin: any) {
  try {
    for (const cfg of REQUIRED_ADMINS) {
      let authUserId: string | null = null;

      const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
        email: cfg.email,
        password: cfg.password,
        email_confirm: true,
        user_metadata: { full_name: cfg.fullName },
      });

      if (newUser?.user?.id) {
        authUserId = newUser.user.id;
      } else {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: cfg.email,
        });
        if (linkData?.user?.id) {
          authUserId = linkData.user.id;
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password: cfg.password,
            email_confirm: true,
          });
        }
      }

      if (!authUserId) continue;

      const { data: existingAdmin } = await supabaseAdmin
        .from("admins")
        .select("id")
        .eq("username", cfg.username)
        .maybeSingle();

      if (existingAdmin && existingAdmin.id !== authUserId) {
        await supabaseAdmin.from("admins").delete().eq("username", cfg.username);
      }

      await supabaseAdmin.from("admins").upsert({
        id: authUserId,
        username: cfg.username,
        full_name: cfg.fullName,
        role: cfg.role,
      });
    }
  } catch (err) {
    console.warn("Notice: ensureAdminAccounts error (handled):", err);
  }
}

async function checkLockout(admin: any, identifier: string) {
  try {
    const { data } = await admin
      .from("login_attempts")
      .select("fail_count, locked_until")
      .eq("identifier", identifier)
      .maybeSingle();
    if (data?.locked_until && new Date(data.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(data.locked_until).getTime() - Date.now()) / 60000);
      throw new Error(`Account locked. Try again in ${mins} minute(s).`);
    }
    return data;
  } catch (e: any) {
    if (e.message?.includes("locked")) throw e;
    return null;
  }
}

async function recordFailure(admin: any, identifier: string, prev: { fail_count: number } | null) {
  try {
    const nextCount = (prev?.fail_count ?? 0) + 1;
    const locked =
      nextCount >= LOCKOUT_MAX
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString()
        : null;
    await admin.from("login_attempts").upsert({
      identifier,
      fail_count: nextCount,
      locked_until: locked,
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* non-fatal attempt logging */
  }
}

async function clearFailures(admin: any, identifier: string) {
  try {
    await admin.from("login_attempts").upsert({
      identifier,
      fail_count: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* non-fatal */
  }
}

// ---------- REGISTER ----------
export const registerStudent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(3).max(120),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().min(7).max(20),
        facultyId: z.string().uuid(),
        departmentId: z.string().uuid(),
        level: z.number().int(),
        password: z.string().min(8),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    const email = data.email.toLowerCase();

    const { data: existingPending, error: epErr } = await supabaseAdmin
      .from("pending_registrations")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (epErr) throw new Error(epErr.message);

    if (existingPending && existingPending.status === "pending") {
      throw new Error("A pending registration already exists for this email.");
    }
    if (existingPending && existingPending.status === "approved") {
      throw new Error("This email is already registered. Please log in.");
    }

    const { data: existingStudent, error: esErr } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (esErr) throw new Error(esErr.message);
    if (existingStudent) throw new Error("This email is already registered. Please log in.");

    // Validate FKs
    const { data: dept, error: dErr } = await supabaseAdmin
      .from("departments")
      .select("id, faculty_id")
      .eq("id", data.departmentId)
      .maybeSingle();

    if (dErr || !dept || dept.faculty_id !== data.facultyId) {
      throw new Error("Invalid department or course selected for the faculty.");
    }

    const password_hash = await bcrypt.hash(data.password, 10);
    const insertPayload: any = {
      full_name: data.fullName,
      email,
      phone: data.phone,
      faculty_id: data.facultyId,
      department_id: data.departmentId,
      level: data.level,
      password_hash,
      status: "pending",
    };

    if (existingPending) {
      const { error: uErr } = await supabaseAdmin
        .from("pending_registrations")
        .update(insertPayload)
        .eq("id", existingPending.id);
      if (uErr) throw new Error(uErr.message);
    } else {
      const { error: iErr } = await supabaseAdmin
        .from("pending_registrations")
        .insert(insertPayload);
      if (iErr) throw new Error(iErr.message);
    }

    return { ok: true };
  });

// ---------- CHECK REGISTRATION / ADMISSION STATUS ----------
export const checkRegistrationStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        query: z
          .string()
          .trim()
          .min(2, "Please enter your registered email, phone, or matric number"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    const q = data.query.trim().toLowerCase();

    // First check pending_registrations table
    const { data: pending } = await supabaseAdmin
      .from("pending_registrations")
      .select("id, full_name, email, phone, status, assigned_matric, rejection_reason")
      .or(`email.ilike.${q},phone.ilike.${q},assigned_matric.ilike.${q}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pending) {
      let matric = pending.assigned_matric;
      if (pending.status === "approved" && !matric) {
        const { data: st } = await supabaseAdmin
          .from("students")
          .select("matric_number")
          .eq("email", pending.email)
          .maybeSingle();
        if (st) matric = st.matric_number;
      }

      return {
        found: true,
        status: pending.status, // "pending" | "approved" | "rejected"
        fullName: pending.full_name,
        email: pending.email,
        assignedMatric: matric ?? null,
        rejectionReason: pending.rejection_reason ?? null,
      };
    }

    // Check students table directly
    const { data: st } = await supabaseAdmin
      .from("students")
      .select("full_name, email, matric_number, status")
      .or(`email.ilike.${q},phone.ilike.${q},matric_number.ilike.${q}`)
      .limit(1)
      .maybeSingle();

    if (st) {
      return {
        found: true,
        status: "approved",
        fullName: st.full_name,
        email: st.email,
        assignedMatric: st.matric_number,
        rejectionReason: null,
      };
    }

    return {
      found: false,
      status: "not_found",
      fullName: null,
      email: null,
      assignedMatric: null,
      rejectionReason: null,
    };
  });

// ---------- STUDENT LOGIN (matric + password) ----------
export const loginStudent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({ matricNumber: z.string().regex(/^\d{6}0209$/), password: z.string().min(1) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    const identifier = `student:${data.matricNumber}`;

    const attempt = await checkLockout(supabaseAdmin, identifier);
    const { data: student, error: sErr } = await supabaseAdmin
      .from("students")
      .select("id, email, status")
      .eq("matric_number", data.matricNumber)
      .maybeSingle();

    if (sErr) throw new Error(sErr.message);

    if (!student) {
      await recordFailure(supabaseAdmin, identifier, attempt);
      throw new Error("Invalid credentials.");
    }

    if (student.status === "suspended")
      throw new Error("Your account is suspended. Contact the Admissions Office.");

    return { email: student.email };
  });

// ---------- ADMIN LOGIN STEP 1 ----------
export const adminUsernameLookup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        username: z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^asu[a-z0-9_]+$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    await ensureAdminAccounts(supabaseAdmin);

    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id, username, full_name")
      .eq("username", data.username)
      .maybeSingle();
    if (!admin) throw new Error("Username not recognised.");
    return { username: admin.username, fullName: admin.full_name };
  });

// ---------- ADMIN LOGIN STEP 2 ----------
export const adminEmailForLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ username: z.string().trim().toLowerCase(), password: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    await ensureAdminAccounts(supabaseAdmin);

    const identifier = `admin:${data.username}`;
    const attempt = await checkLockout(supabaseAdmin, identifier);

    const { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id, username, role")
      .eq("username", data.username)
      .maybeSingle();
    if (!admin) {
      await recordFailure(supabaseAdmin, identifier, attempt);
      throw new Error("Invalid credentials.");
    }
    let email: string | undefined;
    const { data: userInfo, error: userErr } = await supabaseAdmin.auth.admin.getUserById(admin.id);
    if (!userErr && userInfo?.user?.email) {
      email = userInfo.user.email;
    } else {
      const known = REQUIRED_ADMINS.find((a) => a.username === data.username);
      if (known) email = known.email;
    }

    if (!email) throw new Error("Admin account misconfigured.");
    return { email, role: admin.role };
  });

// ---------- SUCCESS / FAILURE reporting from client after supabase.auth.signIn ----------
export const reportLoginResult = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ identifier: z.string(), success: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = (await import("@/integrations/supabase/client.server")) as any;
    if (data.success) {
      await clearFailures(supabaseAdmin, data.identifier);
    } else {
      const { data: prev } = await supabaseAdmin
        .from("login_attempts")
        .select("fail_count")
        .eq("identifier", data.identifier)
        .maybeSingle();
      await recordFailure(supabaseAdmin, data.identifier, prev);
    }
    return { ok: true };
  });
