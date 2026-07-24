import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, GraduationCap, LogOut, Megaphone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/session.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ASU" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchProfile()
      .then((p) => {
        if (!mounted) return;
        if (p?.admin) {
          navigate({ to: "/admin/dashboard", replace: true });
        } else if (p?.student) {
          setProfile(p.student);
          setLoading(false);
        } else {
          navigate({ to: "/login", replace: true });
        }
      })
      .catch((e) => {
        if (!mounted) return;
        toast.error(e.message || "Session expired");
        navigate({ to: "/login", replace: true });
      });
    return () => {
      mounted = false;
    };
  }, [fetchProfile, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (loading) return <DashboardSkeleton />;
  if (!profile) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-muted-foreground">No student profile found for this account.</p>
        <button onClick={signOut} className="btn-primary mt-4">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">ASU Portal</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Student
              </div>
            </div>
          </div>
          <button onClick={signOut} className="btn-secondary py-2 px-4 text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="card-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome</p>
              <h1 className="mt-1 text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-sm text-muted-foreground">
                Matric:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {profile.matric_number}
                </span>
              </p>
            </div>
            <span className="rounded-full bg-[color:var(--success)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
              {profile.status}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Tile icon={User} title="Profile" body={`Level ${profile.level}`} />
          <Tile icon={BookOpen} title="Courses" body="Register this semester's courses" />
          <Tile icon={Megaphone} title="Announcements" body="Latest updates" />
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="card-surface p-5 transition-transform hover:-translate-y-0.5">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
