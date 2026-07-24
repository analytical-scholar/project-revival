import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { BookOpen, LogOut, Megaphone, ShieldCheck, UserCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/session.functions";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — ASU" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchProfile()
      .then((p) => {
        if (!mounted) return;
        if (p?.admin) {
          setAdmin(p.admin);
          setLoading(false);
        } else if (p?.student) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          navigate({ to: "/admin/login", replace: true });
        }
      })
      .catch((e) => {
        if (!mounted) return;
        toast.error(e.message || "Session expired");
        navigate({ to: "/admin/login", replace: true });
      });
    return () => {
      mounted = false;
    };
  }, [fetchProfile, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canAdmissions = admin?.role === "admissions_officer" || admin?.role === "super_admin";
  const canAcademic = admin?.role === "academic_officer" || admin?.role === "super_admin";
  const canComms = admin?.role === "communications_officer" || admin?.role === "super_admin";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">ASU Admin</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {admin?.role?.replace(/_/g, " ") ?? "…"}
              </div>
            </div>
          </div>
          <button onClick={signOut} className="btn-secondary py-2 px-4 text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">
          Welcome{admin?.full_name ? `, ${admin.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the university portal.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {canAdmissions && (
            <Tile
              to="/admin/admissions"
              icon={UserCheck}
              title="Admissions"
              body="Review pending registrations"
            />
          )}
          {canAcademic && (
            <Tile
              to="/admin/dashboard"
              icon={BookOpen}
              title="Academics"
              body="Courses, results, sessions"
            />
          )}
          {canComms && (
            <Tile
              to="/admin/dashboard"
              icon={Megaphone}
              title="Communications"
              body="Announcements & notifications"
            />
          )}
          {admin?.role === "super_admin" && (
            <Tile to="/admin/dashboard" icon={Users} title="Admins" body="Manage administrators" />
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="card-surface block p-5 transition-transform hover:-translate-y-0.5">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
