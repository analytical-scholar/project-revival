import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  XCircle,
  RefreshCw,
  Search,
  Users,
  GraduationCap,
  Clock,
  UserCheck,
} from "lucide-react";
import {
  approveRegistration,
  listPendingRegistrations,
  listEnrolledStudents,
  rejectRegistration,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/admissions")({
  head: () => ({ meta: [{ title: "Admissions & Registrations — ASU Admin" }] }),
  component: AdmissionsPage,
});

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  level: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  assigned_matric: string | null;
  created_at: string;
  faculty: { name: string } | null;
  department: { name: string } | null;
};

type StudentRow = {
  id: string;
  matric_number: string;
  full_name: string;
  email: string;
  phone: string;
  level: number;
  status: string;
  created_at: string;
  faculty: { name: string } | null;
  department: { name: string } | null;
};

function AdmissionsPage() {
  const fetchList = useServerFn(listPendingRegistrations);
  const fetchEnrolled = useServerFn(listEnrolledStudents);
  const approve = useServerFn(approveRegistration);
  const reject = useServerFn(rejectRegistration);

  const [activeView, setActiveView] = useState<"registrations" | "enrolled">("registrations");
  const [rows, setRows] = useState<Row[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Action state
  const [approveModalRow, setApproveModalRow] = useState<Row | null>(null);
  const [rejectModalRow, setRejectModalRow] = useState<Row | null>(null);
  const [matricInput, setMatricInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [pendingData, enrolledData] = await Promise.all([
        fetchList().catch(() => []),
        fetchEnrolled().catch(() => []),
      ]);
      setRows((pendingData as Row[]) ?? []);
      setEnrolledStudents((enrolledData as StudentRow[]) ?? []);
    } catch (e: any) {
      toast.error(`Failed to load data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Quick Direct Approve
  async function handleQuickApprove(r: Row) {
    setBusyId(r.id);
    try {
      const res = await approve({ data: { id: r.id } });
      toast.success(
        `🎉 Approved ${r.full_name}!\nAssigned Matric: ${res.matricNumber}\nEmail notification sent to ${r.email}`,
        { duration: 6000 },
      );
      await reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve registration");
    } finally {
      setBusyId(null);
    }
  }

  // Custom Matric Approve
  async function handleModalApprove() {
    if (!approveModalRow) return;
    if (matricInput && !/^\d{6}0209$/.test(matricInput)) {
      return toast.error("Matric number must be 10 digits ending in 0209 (e.g. 1234560209)");
    }
    setBusyId(approveModalRow.id);
    try {
      const res = await approve({
        data: { id: approveModalRow.id, matricNumber: matricInput || undefined },
      });
      toast.success(
        `🎉 Approved ${approveModalRow.full_name}!\nAssigned Matric: ${res.matricNumber}\nNotification email dispatched to ${approveModalRow.email}`,
        { duration: 6000 },
      );
      setApproveModalRow(null);
      setMatricInput("");
      await reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve registration");
    } finally {
      setBusyId(null);
    }
  }

  // Reject Submit
  async function handleModalReject() {
    if (!rejectModalRow) return;
    setBusyId(rejectModalRow.id);
    try {
      await reject({
        data: { id: rejectModalRow.id, reason: reasonInput || undefined },
      });
      toast.success(
        `Registration declined for ${rejectModalRow.full_name}.\nNotification email dispatched to ${rejectModalRow.email}`,
        { duration: 5000 },
      );
      setRejectModalRow(null);
      setReasonInput("");
      await reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject registration");
    } finally {
      setBusyId(null);
    }
  }

  const query = searchQuery.toLowerCase().trim();

  const filteredRows = rows.filter((r) => {
    const matchesFilter = filterTab === "all" ? true : r.status === filterTab;
    const matchesQuery =
      !query ||
      r.full_name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.phone.includes(query) ||
      (r.assigned_matric && r.assigned_matric.toLowerCase().includes(query)) ||
      (r.faculty?.name && r.faculty.name.toLowerCase().includes(query)) ||
      (r.department?.name && r.department.name.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  });

  const filteredEnrolled = enrolledStudents.filter((s) => {
    return (
      !query ||
      s.full_name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.phone.includes(query) ||
      s.matric_number.toLowerCase().includes(query) ||
      (s.faculty?.name && s.faculty.name.toLowerCase().includes(query)) ||
      (s.department?.name && s.department.name.toLowerCase().includes(query))
    );
  });

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const rejectedCount = rows.filter((r) => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="border-b border-border bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <button
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh List
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admissions & Student Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review student registrations, manage approvals, and view matriculated students.
            </p>
          </div>

          {/* Main View Switcher */}
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
            <button
              onClick={() => setActiveView("registrations")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeView === "registrations"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Applicant Registrations ({rows.length})
            </button>
            <button
              onClick={() => setActiveView("enrolled")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeView === "enrolled"
                  ? "bg-white text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Enrolled Students ({enrolledStudents.length})
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-xs flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{rows.length}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Applicants</div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
              <div className="text-xs font-medium text-amber-700">Pending Review</div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-900">{approvedCount}</div>
              <div className="text-xs font-medium text-emerald-700">Approved Applicants</div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-800">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-900">{enrolledStudents.length}</div>
              <div className="text-xs font-medium text-blue-700">Active Students</div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or matric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white pl-9 pr-4 py-2 text-xs focus:border-primary focus:outline-none shadow-xs"
            />
          </div>

          {activeView === "registrations" && (
            <div className="flex items-center gap-1 rounded-xl bg-muted/70 p-1 border border-border">
              {(
                [
                  { id: "all", label: `All (${rows.length})` },
                  { id: "pending", label: `Pending (${pendingCount})` },
                  { id: "approved", label: `Approved (${approvedCount})` },
                  { id: "rejected", label: `Rejected (${rejectedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    filterTab === tab.id
                      ? "bg-white text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Data Table */}
        <div className="mt-4 card-surface overflow-hidden border border-border/80 shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span>Fetching records from database...</span>
            </div>
          ) : activeView === "registrations" ? (
            filteredRows.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  No {filterTab !== "all" ? filterTab : ""} registrations found
                </p>
                <p className="mt-1 text-xs">
                  {searchQuery
                    ? `No applicants match "${searchQuery}".`
                    : "There are no student registrations in this category."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/80 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5">Student Details</th>
                      <th className="px-4 py-3.5">Faculty / Department</th>
                      <th className="px-4 py-3.5">Level</th>
                      <th className="px-4 py-3.5">Registration Date</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRows.map((r) => {
                      const isBusy = busyId === r.id;
                      const dateStr = new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-foreground">{r.full_name}</div>
                            <div className="text-xs text-muted-foreground">{r.email}</div>
                            <div className="text-xs text-muted-foreground font-mono">{r.phone}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-foreground">
                              {r.faculty?.name ?? "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.department?.name ?? "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
                              {r.level} Level
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">{dateStr}</td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={r.status} />
                            {r.assigned_matric && (
                              <div className="mt-1 font-mono text-[11px] font-bold text-primary">
                                {r.assigned_matric}
                              </div>
                            )}
                            {r.rejection_reason && (
                              <div
                                className="mt-1 text-[11px] text-destructive max-w-xs truncate"
                                title={r.rejection_reason}
                              >
                                Reason: {r.rejection_reason}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {r.status === "pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleQuickApprove(r)}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  {isBusy ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModalRow(r);
                                    setReasonInput("");
                                  }}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium uppercase">
                                Processed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredEnrolled.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No enrolled students found</p>
              <p className="mt-1 text-xs">
                {searchQuery
                  ? `No active students match "${searchQuery}".`
                  : "There are no active enrolled students in the database."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/80 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5">Matric Number</th>
                    <th className="px-4 py-3.5">Student Name & Contact</th>
                    <th className="px-4 py-3.5">Faculty / Department</th>
                    <th className="px-4 py-3.5">Level</th>
                    <th className="px-4 py-3.5">Enrollment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEnrolled.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-sm font-bold text-primary">
                        {s.matric_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">{s.full_name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                        <div className="text-xs text-muted-foreground font-mono">{s.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {s.faculty?.name ?? "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.department?.name ?? "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
                          {s.level} Level
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold uppercase text-emerald-800">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Approve Modal for optional custom Matric */}
      {approveModalRow && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setApproveModalRow(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">Approve Registration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Approving <strong className="text-foreground">{approveModalRow.full_name}</strong> (
              {approveModalRow.email}).
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Matriculation Number (Optional)
                </label>
                <input
                  type="text"
                  className="input-field mt-1 font-mono text-sm"
                  placeholder="Leave blank to auto-generate (e.g. 1234560209)"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Must be 10 digits ending with 0209 if provided manually.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] text-emerald-900">
                <strong>Notification Notice:</strong> Approving this student provisions their portal
                account and dispatches an automated notification email containing their assigned
                matriculation number to <strong>{approveModalRow.email}</strong>.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn-secondary py-1.5 px-3 text-xs"
                onClick={() => setApproveModalRow(null)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                onClick={handleModalApprove}
                disabled={busyId === approveModalRow.id}
              >
                {busyId === approveModalRow.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalRow && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setRejectModalRow(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">Decline Registration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rejecting <strong className="text-foreground">{rejectModalRow.full_name}</strong> (
              {rejectModalRow.email}).
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reason for Rejection
                </label>
                <textarea
                  className="input-field mt-1 text-sm"
                  rows={3}
                  placeholder="Enter rejection explanation to send to applicant..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn-secondary py-1.5 px-3 text-xs"
                onClick={() => setRejectModalRow(null)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                onClick={handleModalReject}
                disabled={busyId === rejectModalRow.id}
              >
                {busyId === rejectModalRow.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${styles[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
