import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ASU Student Portal" },
      {
        name: "description",
        content: "About Analytical Scholar University and the ASU Student Portal.",
      },
      { property: "og:title", content: "About ASU" },
      { property: "og:description", content: "Learn about Analytical Scholar University." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">About ASU</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Analytical Scholar University (ASU) is a modern institution committed to academic
          excellence, scholarly research, and student success. The ASU Student Portal is the central
          hub for every student's academic journey — from admission to graduation.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card-surface p-6">
            <h2 className="text-xl font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To empower scholars with a secure, transparent, and efficient digital experience
              across every academic milestone.
            </p>
          </div>
          <div className="card-surface p-6">
            <h2 className="text-xl font-semibold">Our Vision</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              To be the leading digital-first university, blending rigorous scholarship with modern
              technology.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  ),
});
