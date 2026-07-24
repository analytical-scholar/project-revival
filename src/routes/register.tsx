import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { GraduationCap, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { registerSchema } from "@/lib/schemas";
import { listDepartments, listFaculties } from "@/lib/reference.functions";
import { registerStudent } from "@/lib/auth.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — ASU Student Portal" },
      { name: "description", content: "Register for admission at Analytical Scholar University." },
    ],
  }),
  component: RegisterPage,
});

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  facultyId: string;
  departmentId: string;
  level: number;
  password: string;
  confirmPassword: string;
};

function RegisterPage() {
  const navigate = useNavigate();
  const fetchFaculties = useServerFn(listFaculties);
  const fetchDepartments = useServerFn(listDepartments);
  const submit = useServerFn(registerStudent);
  const [faculties, setFaculties] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: string; faculty_id: string; name: string }>
  >([]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { level: 100 },
  });
  const facultyId = watch("facultyId");
  const filteredDepts = useMemo(
    () => departments.filter((d) => d.faculty_id === facultyId),
    [departments, facultyId],
  );

  useEffect(() => {
    Promise.all([fetchFaculties(), fetchDepartments()])
      .then(([f, d]) => {
        setFaculties(f);
        setDepartments(d);
      })
      .catch((e) => toast.error(e.message || "Failed to load form"));
  }, [fetchFaculties, fetchDepartments]);

  useEffect(() => {
    setValue("departmentId", "");
  }, [facultyId, setValue]);

  async function onSubmit(values: FormValues) {
    const parsed = registerSchema.safeParse({ ...values, level: Number(values.level) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    try {
      await submit({
        data: {
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          facultyId: parsed.data.facultyId,
          departmentId: parsed.data.departmentId,
          level: parsed.data.level,
          password: parsed.data.password,
        },
      });
      navigate({ to: "/registration-submitted" });
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
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
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                Register for admission at Analytical Scholar University.
              </p>
            </div>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Full Name" error={errors.fullName?.message} className="md:col-span-2">
              <input
                className="input-field"
                placeholder="John Doe"
                {...register("fullName", { required: "Full name required" })}
              />
            </Field>
            <Field label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register("email", { required: "Email required" })}
              />
            </Field>
            <Field label="Phone Number" error={errors.phone?.message}>
              <input
                className="input-field"
                placeholder="+234..."
                {...register("phone", { required: "Phone required" })}
              />
            </Field>
            <Field label="Faculty" error={errors.facultyId?.message}>
              <select
                className="input-field"
                {...register("facultyId", { required: "Select faculty" })}
              >
                <option value="">Select faculty</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department / Course of Study" error={errors.departmentId?.message}>
              <select
                className="input-field"
                disabled={!facultyId}
                {...register("departmentId", { required: "Select course / department" })}
              >
                <option value="">
                  {facultyId ? "Select course / department" : "Select a faculty first"}
                </option>
                {filteredDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Level" error={errors.level?.message}>
              <select
                className="input-field"
                {...register("level", { required: true, valueAsNumber: true })}
              >
                {[100, 200, 300, 400, 500].map((n) => (
                  <option key={n} value={n}>
                    {n} Level
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2 border-t border-border pt-2" />
            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                className="input-field"
                placeholder="Min 8 chars, mixed case, number"
                {...register("password", { required: "Password required" })}
              />
            </Field>
            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <input
                type="password"
                className="input-field"
                {...register("confirmPassword", { required: "Confirm your password" })}
              />
            </Field>
            <div className="md:col-span-2 mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary">
                  Login
                </Link>
              </p>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Registration
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
