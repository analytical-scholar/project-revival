import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CheckCircle2, Search, Loader2, XCircle, Clock, Copy, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { checkRegistrationStatus } from "@/lib/auth.functions";
import toast from "react-hot-toast";

export const Route = createFileRoute("/registration-submitted")({
  head: () => ({ meta: [{ title: "Registration Submitted — ASU" }] }),
  component: RegistrationSubmittedPage,
});

function RegistrationSubmittedPage() {
  const navigate = useNavigate();
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
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface p-8 text-center"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Registration Submitted!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your registration has been received successfully.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your application is currently awaiting review by the Admissions Office. Once approved,
            your matric number will be generated and assigned to your account.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="btn-primary flex-1">
              Go to Portal Login
            </Link>
          </div>
        </motion.div>

        {/* Live Status Checker Box */}
        <div className="card-surface p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Check Admission Status
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter your registered email address or phone number to check if your application has
            been approved or declined.
          </p>
          <form onSubmit={handleCheck} className="flex gap-2">
            <input
              type="text"
              required
              className="input-field text-xs flex-1"
              placeholder="e.g. user@example.com or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-4 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Status"}
            </button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-left"
            >
              {!result.found ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 text-xs">
                  <p className="font-bold">No Record Found</p>
                  <p className="mt-1">
                    No application was found matching <strong>"{query}"</strong>. Please verify your
                    email or phone number.
                  </p>
                </div>
              ) : result.status === "approved" ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 text-emerald-950 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm">Admission Approved!</h3>
                      <p className="text-xs text-emerald-700">Congratulations {result.fullName}!</p>
                    </div>
                  </div>

                  {result.assignedMatric ? (
                    <div className="rounded-xl bg-white p-4 border border-emerald-200 shadow-xs space-y-2">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Assigned Matriculation Number
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
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-800">
                      Your admission is approved. Your matriculation number is being finalized.
                    </p>
                  )}

                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                  >
                    Login to Student Portal <ArrowRight className="h-4 w-4" />
                  </Link>
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
                    <span className="font-bold block mb-1">Reason:</span>
                    <p>{result.rejectionReason || "Details do not meet admission requirements."}</p>
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
                    Your application is currently pending evaluation by the Admissions Office.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
