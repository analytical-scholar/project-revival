import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { checkRegistrationStatus, loginStudent, reportLoginResult } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Student Login — ASU" }] }),
  component: LoginPage,
});

type Values = { matricNumber: string; password: string; remember: boolean };

function LoginPage() {
  const navigate = useNavigate();
  const lookup = useServerFn(loginStudent);
  const report = useServerFn(reportLoginResult);
  const [activeTab, setActiveTab] = useState<"login" | "status" | "forgot">("login");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Values>();

  async function onSubmit(v: Values) {
    try {
      const { email } = await lookup({
        data: { matricNumber: v.matricNumber, password: v.password },
      });
      const { error } = await supabase.auth.signInWithPassword({ email, password: v.password });
      const identifier = `student:${v.matricNumber}`;
      if (error) {
        await report({ data: { identifier, success: false } });
        throw new Error("Invalid credentials.");
      }
      await report({ data: { identifier, success: true } });
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    }
  }

  async function forgot(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent.");
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Student Portal</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "login" && "Sign in with your matriculation number."}
                {activeTab === "status" && "Check your registration status & matric number."}
                {activeTab === "forgot" && "Reset your portal password."}
              </p>
            </div>
          </div>

          {/* Quick Tab Selection */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`rounded-lg py-2 transition-all ${
                activeTab === "login"
                  ? "bg-white text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Student Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`rounded-lg py-2 transition-all ${
                activeTab === "status"
                  ? "bg-white text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Check Application Result
            </button>
          </div>

          {activeTab === "login" && (
            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Matric Number
                </span>
                <input
                  className="input-field font-mono"
                  placeholder="e.g. 1234560209"
                  {...register("matricNumber", { required: "Matric required" })}
                />
                {errors.matricNumber && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.matricNumber.message}
                  </span>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </span>
                <input
                  type="password"
                  className="input-field"
                  {...register("password", { required: "Password required" })}
                />
                {errors.password && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.password.message}
                  </span>
                )}
              </label>
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[color:var(--primary)]"
                    {...register("remember")}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab("forgot")}
                  className="font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <button className="btn-primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Login
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Don't know your matric number?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("status")}
                  className="font-semibold text-primary hover:underline"
                >
                  Check status here
                </button>
              </p>
            </form>
          )}

          {activeTab === "status" && (
            <StatusCheckerWidget
              onUseMatric={(matric) => {
                setValue("matricNumber", matric);
                setActiveTab("login");
              }}
            />
          )}

          {activeTab === "forgot" && (
            <ForgotForm onCancel={() => setActiveTab("login")} onSubmit={forgot} />
          )}
        </motion.div>
      </div>
    </SiteLayout>
  );
}

function StatusCheckerWidget({ onUseMatric }: { onUseMatric: (matric: string) => void }) {
  const checkStatusFn = useServerFn(checkRegistrationStatus);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    status: string;
    fullName?: string | null;
    email?: string | null;
    assignedMatric?: string | null;
    rejectionReason?: string | null;
  } | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await checkStatusFn({ data: { query: query.trim() } });
      setResult(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to check status");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Matric number copied!");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Registered Email or Phone Number
          </span>
          <div className="relative">
            <input
              type="text"
              required
              className="input-field pr-10 text-sm"
              placeholder="e.g. abdulghaffaropeyemi@gmail.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Admission Status"}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          {!result.found ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-xs">
              <p className="font-bold">No Registration Record Found</p>
              <p className="mt-1">
                We could not find any registration associated with <strong>"{query}"</strong>.
                Please check your spelling or register for a new account.
              </p>
            </div>
          ) : result.status === "approved" ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 text-emerald-950 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Admission Accepted & Approved!</h3>
                  <p className="text-xs text-emerald-700">Congratulations {result.fullName}!</p>
                </div>
              </div>

              {result.assignedMatric ? (
                <div className="rounded-xl bg-white p-4 border border-emerald-200 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Your Assigned Matriculation Number
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xl font-black text-emerald-700 tracking-wider">
                      {result.assignedMatric}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.assignedMatric!)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Use this matric number and your password to sign in to the Student Portal.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-800">
                  Your admission is approved. Your matriculation number is being finalized.
                </p>
              )}

              {result.assignedMatric && (
                <button
                  onClick={() => onUseMatric(result.assignedMatric!)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Proceed to Sign In <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : result.status === "rejected" ? (
            <div className="rounded-2xl border border-red-300 bg-red-50/80 p-5 text-red-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2.5 text-red-800">
                <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Registration Declined</h3>
                  <p className="text-xs text-red-700">Applicant: {result.fullName}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 border border-red-200 text-xs text-red-900">
                <span className="font-bold block mb-1">Reason from Admissions Office:</span>
                <p>
                  {result.rejectionReason ||
                    "Your details do not meet current admission specifications."}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-amber-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Clock className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Application Under Review</h3>
                  <p className="text-xs text-amber-700">Applicant: {result.fullName}</p>
                </div>
              </div>
              <p className="text-xs text-amber-900">
                Your registration is currently pending evaluation by the Admissions Office. Check
                back shortly to receive your assigned matric number upon approval.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ForgotForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (email: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSubmit(email);
        setBusy(false);
      }}
    >
      <h2 className="text-lg font-semibold">Reset password</h2>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Registered email
        </span>
        <input
          type="email"
          required
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Back
        </button>
        <button className="btn-primary flex-1" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
        </button>
      </div>
    </form>
  );
}
