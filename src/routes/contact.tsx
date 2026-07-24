import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ASU Student Portal" },
      {
        name: "description",
        content: "Get in touch with Analytical Scholar University Admissions Office and support.",
      },
      { property: "og:title", content: "Contact ASU" },
      { property: "og:description", content: "Contact the ASU Admissions Office." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">Contact us</h1>
        <p className="mt-3 text-muted-foreground">
          Reach the ASU Admissions Office for enquiries about registration and approvals.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: "admissions@asu.edu" },
            { icon: Phone, label: "Phone", value: "+234 800 000 0000" },
            { icon: MapPin, label: "Address", value: "ASU Main Campus, Nigeria" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-surface p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
