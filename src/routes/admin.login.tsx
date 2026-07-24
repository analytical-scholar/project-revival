import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminEmailForLogin, adminUsernameLookup, reportLoginResult } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — ASU" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const step1 = useServerFn(adminUsernameLookup);
  const step2 = useServerFn(adminEmailForLogin);
  const report = useServerFn(reportLoginResult);
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function next(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const info = await step1({ data: { username: username.trim().toLowerCase() } });
      setFullName(info.fullName);
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Unknown username");
    } finally {
      setBusy(false);
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { email } = await step2({
        data: { username: username.trim().toLowerCase(), password },
      });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      const identifier = `admin:${username.trim().toLowerCase()}`;
      if (error) {
        await report({ data: { identifier, success: false } });
        throw new Error("Invalid credentials.");
      }
      await report({ data: { identifier, success: true } });
      toast.success("Welcome, admin");
      navigate({ to: "/admin/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface w-full p-8"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">Sign in to continue</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={next}
                className="grid gap-5"
              >
                <p className="text-sm font-medium">Enter your admin username</p>
                <input
                  className="input-field"
                  placeholder="asu..."
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                <button className="btn-primary" disabled={busy || !username.startsWith("asu")}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Next
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Username must start with <code className="rounded bg-muted px-1">asu</code>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onSubmit={login}
                className="grid gap-5"
              >
                <div className="rounded-xl bg-muted p-3 text-sm">
                  <p className="font-semibold">{fullName}</p>
                  <p className="text-xs text-muted-foreground">{username}</p>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </span>
                  <input
                    type="password"
                    className="input-field"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </label>
                <button className="btn-primary" disabled={busy || !password}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Login
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setStep(1);
                    setPassword("");
                  }}
                >
                  ← Use a different account
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
