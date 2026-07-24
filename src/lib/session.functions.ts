import { createServerFn } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KNOWN_ADMINS = [
  {
    username: "asuadmin",
    email: "asuadmin@asu.edu.ng",
    fullName: "System Administrator",
    role: "super_admin",
  },
  {
    username: "asuregistrar",
    email: "asuregistrar@asu.edu.ng",
    fullName: "Admissions Registrar",
    role: "admissions_officer",
  },
  {
    username: "asuacademic",
    email: "asuacademic@asu.edu.ng",
    fullName: "Academic Officer",
    role: "academic_officer",
  },
];

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Immediately query admins table by verified auth userId
    let { data: admin } = await supabaseAdmin
      .from("admins")
      .select("id, username, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    // Fallback: If not found in admins table by ID, check if this auth user email matches a known admin
    if (!admin) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const email = userData?.user?.email?.toLowerCase();
      if (email) {
        const known = KNOWN_ADMINS.find((a) => a.email.toLowerCase() === email);
        if (known) {
          await supabaseAdmin.from("admins").upsert({
            id: userId,
            username: known.username,
            full_name: known.fullName,
            role: known.role,
          });
          admin = {
            id: userId,
            username: known.username,
            full_name: known.fullName,
            role: known.role,
          };
        }
      }
    }

    if (admin) {
      return { admin, student: null };
    }

    // 2. Query students table
    const { data: student } = await supabaseAdmin
      .from("students")
      .select(
        "id, matric_number, full_name, email, phone, level, status, faculty_id, department_id",
      )
      .eq("id", userId)
      .maybeSingle();

    return { admin: null, student };
  });
