import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ASU Student Portal" },
      {
        name: "description",
        content:
          "Everything the ASU Student Portal offers — registration, courses, results, announcements, and secure access.",
      },
      { property: "og:title", content: "ASU Portal Features" },
      { property: "og:description", content: "Explore the full ASU Student Portal feature set." },
    ],
  }),
  component: FeaturesPage,
});

const items = [
  {
    icon: UserCheck,
    title: "Guided Admissions",
    body: "Apply online and track your admission status until your matric number is issued.",
  },
  {
    icon: GraduationCap,
    title: "Student Dashboard",
    body: "One place for your academic identity, level, and department.",
  },
  {
    icon: BookOpen,
    title: "Course Registration",
    body: "Enroll each semester with a searchable, department-aware course catalog.",
  },
  {
    icon: ClipboardCheck,
    title: "Results & Transcripts",
    body: "View scores and grades as they are released by academic officers.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    body: "Never miss important updates from admissions, faculty, or communications.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    body: "Row-Level Security, hashed passwords, and lockout protection.",
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">Features</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Everything students and administrators need in one modern portal.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="card-surface p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
