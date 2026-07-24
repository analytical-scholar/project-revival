import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASU Portal | Analytical Scholar University" },
      {
        name: "description",
        content:
          "A secure digital platform where students access courses, academic records, announcements, and university services at Analytical Scholar University.",
      },
      { property: "og:title", content: "ASU Portal | Analytical Scholar University" },
      {
        property: "og:description",
        content:
          "A secure digital platform where students access courses, academic records, announcements, and university services.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

const INK = "#1E293B";
const PRIMARY = "#2563EB";
const SURFACE = "#F8FAFC";

function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

function useCountUp(target: number, isDecimal = false) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const start = performance.now();
          const duration = 1800;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const v = isDecimal ? target * p : Math.floor(target * p);
            setValue(v);
            if (p < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, isDecimal]);
  return { ref, value: isDecimal ? value.toFixed(1) : value.toLocaleString() };
}

function Stat({ target, label, decimal }: { target: number; label: string; decimal?: boolean }) {
  const { ref, value } = useCountUp(target, decimal);
  return (
    <div
      ref={ref}
      className="text-center rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
    >
      <div className="mb-2 text-3xl font-bold text-white md:text-5xl">{value}</div>
      <div className="text-sm font-medium text-white/70">{label}</div>
    </div>
  );
}

function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{ background: SURFACE, color: "#191c1e" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 h-16 w-full shadow-sm md:h-20"
        style={{ background: SURFACE }}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 md:px-16">
          <Link to="/" className="flex items-center gap-3">
            <Icon name="school" className="text-3xl" style={{ color: PRIMARY }} />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-bold tracking-tight" style={{ color: PRIMARY }}>
                ASU Portal
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-500 md:block">
                Analytical Scholar University
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link
              to="/about"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              About
            </Link>
            <Link
              to="/features"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Features
            </Link>
            <Link
              to="/contact"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Contact
            </Link>
            <Link
              to="/admin/login"
              className="hidden items-center rounded-lg px-4 py-2 font-semibold hover:bg-blue-50 md:inline-flex"
              style={{ color: PRIMARY }}
            >
              Admin Portal
            </Link>
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex h-[707px] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDabdgUFUsSprU9Ep9EOv983_7D9d0UITINvdSBbZPBp4qN9RuH6jZzGoggGteMZlWO7CezOoZG5YrZmAuel0TRU_HYO5n_Bbhaolg9AQejIAocD0nUX4d0SjkRcKWHnPUXYFlHkygd0wE__qCWoQEbrjQuH2k46DV2H3PFfh1slLudGSc_1LUBvZJSdCS81rrdmGU2XFEuc8zPdRd4PbPDKIUL9CDmAQMrNjET8zUOYjcdFS-OKsrjXGvMLAPHMDqn3o8fzT0sFYaL')",
              }}
            />
            <div className="absolute inset-0" style={{ background: `${INK}B3` }} />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-6 text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:leading-[1.1]">
              Welcome to Analytical Scholar University Student Portal
            </h1>
            <p className="mb-10 text-balance text-lg text-white/80">
              A secure digital platform where students can access courses, academic records,
              announcements, and university services.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:-translate-y-1"
                style={{ background: PRIMARY }}
              >
                Access Student Portal
              </Link>
              <Link
                to="/admin/login"
                className="rounded-lg border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                Administration Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Portal Cards */}
        <section className="relative z-20 -mt-20 px-4 pb-20">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 md:grid-cols-2">
            <div className="group rounded-[1.5rem] border border-slate-200 bg-white p-8 academic-shadow transition-all duration-300 hover:border-blue-600">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ background: `${PRIMARY}1A`, color: PRIMARY }}
              >
                <Icon name="school" className="text-4xl" />
              </div>
              <h3 className="mb-4 text-2xl font-semibold">Student Portal</h3>
              <p className="mb-6 text-slate-600">
                Personalized learning environment for academic success and engagement.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Secure Student Login",
                  "Course Registration & Enrollment",
                  "Personalized Academic Dashboard",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-slate-600">
                    <Icon name="check_circle" className="text-xl" style={{ color: PRIMARY }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="rounded-lg py-3 text-center font-medium text-white"
                  style={{ background: PRIMARY }}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg border border-slate-200 py-3 text-center font-medium text-slate-800 hover:border-blue-600 hover:text-blue-700"
                >
                  Register
                </Link>
              </div>
            </div>

            <div className="group rounded-[1.5rem] border border-slate-200 bg-white p-8 academic-shadow transition-all duration-300 hover:border-slate-900">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ background: `${INK}1A`, color: INK }}
              >
                <Icon name="security" className="text-4xl" />
              </div>
              <h3 className="mb-4 text-2xl font-semibold">Administration Portal</h3>
              <p className="mb-6 text-slate-600">
                Comprehensive management system for university staff and faculty operations.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Student Management System",
                  "Faculty Records & Planning",
                  "System-wide Announcements",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-slate-600">
                    <Icon name="check_circle" className="text-xl" style={{ color: INK }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/admin/login"
                className="block w-full rounded-lg py-3 text-center font-medium text-white"
                style={{ background: INK }}
              >
                Manage Institutions
              </Link>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="px-4 py-20" style={{ background: PRIMARY }}>
          <div className="mx-auto max-w-[1280px]">
            <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
              <Stat target={10000} label="Students Enrolled" />
              <Stat target={500} label="Specialized Courses" />
              <Stat target={12} label="Global Faculties" />
              <Stat target={99.9} label="Secure Platform" decimal />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-24" style={{ background: "#f2f4f6" }}>
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-semibold md:text-4xl">University Features</h2>
              <p className="mx-auto max-w-2xl text-slate-600">
                All the tools you need to excel academically, organized in a structured and
                intuitive digital ecosystem.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  i: "dashboard",
                  t: "Student Dashboard",
                  d: "A unified view of your current courses, pending tasks, and upcoming deadlines.",
                },
                {
                  i: "app_registration",
                  t: "Course Registration",
                  d: "Streamlined enrollment process with real-time availability and academic planning.",
                },
                {
                  i: "analytics",
                  t: "Results & Transcript",
                  d: "Instant access to semester results, cumulative GPA, and official transcript requests.",
                },
                {
                  i: "campaign",
                  t: "Announcements",
                  d: "Stay updated with official university news, event schedules, and policy changes.",
                },
                {
                  i: "notifications_active",
                  t: "Notifications",
                  d: "Real-time alerts for grade postings, class cancellations, and system updates.",
                },
                {
                  i: "admin_panel_settings",
                  t: "Administration",
                  d: "Manage your profile, tuition payments, and official documents in one secure place.",
                },
              ].map((f) => (
                <div
                  key={f.t}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-8 academic-shadow transition-shadow hover:shadow-xl"
                >
                  <Icon name={f.i} className="text-4xl" style={{ color: PRIMARY }} />
                  <h4 className="text-xl font-bold">{f.t}</h4>
                  <p className="text-slate-600">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="px-4 py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-semibold md:text-4xl">Latest Announcements</h2>
                <p className="text-slate-600">Stay informed about the recent happenings at ASU.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  tag: "Academic",
                  tagColor: PRIMARY,
                  title: "Fall Semester Registration Now Open",
                  body: "Enrollment for the upcoming Fall semester is now officially open for all returning and new students. Please check your dashboard for eligibility.",
                  date: "Oct 12, 2024",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJwlshqPXSfwsanVgQSM1fhXCVQWlCoAVusidltqq2ZhvUjQTUz_uexv18bTKvN1Wrd3EcbGfSss22uD0SYJ0I_Rlx8mHeBBDdtfcRO0VHrF0Uqoun7VsvCdlIfrXkJehZw7ncB5sIeX4WUFXCogkm2fbYZuIAmeMvxEfbwppA708q00avMYmuhmT4oEWfiVuNGJIuuP91OKbAbBaAPIcM3eKQ3L9lB4yCDruK4mp7P4jdlndHbgfTjcFWRSsh2lZT2L1J8kNKSDih",
                },
                {
                  tag: "Security",
                  tagColor: "#ba1a1a",
                  title: "New Multi-Factor Authentication",
                  body: "To ensure the safety of your academic records, ASU is implementing a new MFA system. All users must update their security settings by end of month.",
                  date: "Oct 08, 2024",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwEL8c55Kd4VSYehvMzE1rhAJxLvp_hzEhjF41inwcDROvhckgdcpB6zqutv51b5kD9kliOw4t6Td_OWc-vzX1--BffPF_gMQAC933Eu9NSTjB3MX9umauJ_EiqPsWn5C4YDMAx1K-baqsoJtXxP_7oI5NDzbX8yZ-PDDMcjaVG5AImhtZAea_Kjh3ZGyA47gkH5q0q3f_SpcRE0-uW2wKO88E-witHZTuyWWAlhbbzNOIyMh2_Ko7VwU4wu8YRNzpjcSaEu4QWKYv",
                },
                {
                  tag: "Events",
                  tagColor: "#46566c",
                  title: "Annual Research Symposium",
                  body: "Join us for a week-long showcase of groundbreaking research conducted by our distinguished faculty and students across all disciplines.",
                  date: "Oct 05, 2024",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvAFygSE1z1WoPGBBsJmsY6C2CTqTY3MhAiXlOmDQ4pnBMuT2Tpa9f_UxTzuniI9il-w2p8jYYXXsH5ukGz937D98-3Ho3FIvIXzAr-PWGynMFMapaKAN3JO3DKLeSWI-R801VZIWqWUYJaj3Y-LGPCkLkEpZhfjuvOb7Rz8dyqZdvPCTPJbbmqjt8zzSI7DLFD0OunZKnENzV7E4KZUVTuJtUKr-e2EzGpSxa4wNsDpE6LgmWI7p5jbtd43IQTCZA5F85ffGIANjf",
                },
              ].map((a) => (
                <article
                  key={a.title}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white academic-shadow"
                >
                  <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${a.img}')` }}
                  />
                  <div className="flex flex-grow flex-col p-6">
                    <span
                      className="mb-4 w-fit rounded px-2 py-1 text-xs font-semibold"
                      style={{ color: a.tagColor, background: `${a.tagColor}1A` }}
                    >
                      {a.tag}
                    </span>
                    <h3 className="mb-3 text-xl font-bold">{a.title}</h3>
                    <p className="mb-6 line-clamp-3 text-slate-600">{a.body}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-slate-500">{a.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section
          className="relative overflow-hidden px-4 py-24 text-white"
          style={{ background: INK }}
        >
          <div className="relative z-10 mx-auto max-w-[1280px]">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-semibold md:text-4xl">Why Choose ASU Portal?</h2>
                <p className="mb-10 text-lg text-white/70">
                  We provide a world-class digital experience that matches the excellence of our
                  physical campus.
                </p>
                <div className="space-y-8">
                  {[
                    {
                      i: "lightbulb",
                      t: "Modern Learning",
                      d: "Integrative digital tools that foster collaboration and simplify the learning journey for every student.",
                    },
                    {
                      i: "shield",
                      t: "Secure Records",
                      d: "Enterprise-grade encryption protecting your personal data and academic achievements at all times.",
                    },
                    {
                      i: "devices",
                      t: "Digital University Experience",
                      d: "Access all university resources from any device, anywhere in the world, without compromise.",
                    },
                  ].map((f) => (
                    <div key={f.t} className="flex gap-6">
                      <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: PRIMARY }}
                      >
                        <Icon name={f.i} className="text-3xl" />
                      </div>
                      <div>
                        <h4 className="mb-2 text-xl font-bold">{f.t}</h4>
                        <p className="text-white/60">{f.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-[2.5rem] border-8 border-white/10 academic-shadow md:rotate-3">
                  <div
                    className="h-96 w-full bg-cover bg-center md:h-[500px]"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMeYd_TrHqpaYMwfa0GQEuPZPdyLu1FozlHVsjQftRLlVadYA5lGv0wEZUy_E5VmXrvaDezB4OfvSQeMNlEsI8fdKBFp_nF6TaFDKq_uSL40HQYcYdEkDj4RfDu6UXjZVPIM5Sn-4fJVQ50-3feTS8UqbIAyWsa5owGp5YxybYIFXZTfBr4BBLxQrwP2rZpVt8wLM4eNZjBvIIAGwFfgkM6pvaA6e4oyWFHPwBx6AmCHT9mIsYS61tIzab_2SdCEyEdpvvnx1XC_WM')",
                    }}
                  />
                </div>
                <div
                  className="absolute -bottom-6 -left-6 hidden rounded-2xl p-6 academic-shadow md:block"
                  style={{ background: PRIMARY }}
                >
                  <div className="text-2xl font-bold">100% Digital</div>
                  <div className="text-white/70">Transformation Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-24">
          <div
            className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-12 text-center text-white academic-shadow"
            style={{ background: PRIMARY }}
          >
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-semibold md:text-4xl">
                Begin Your Academic Journey
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
                Join the Analytical Scholar University community today and experience a new era of
                digital academic excellence.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/login"
                  className="rounded-lg bg-white px-10 py-4 text-lg font-bold hover:bg-slate-100"
                  style={{ color: PRIMARY }}
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="rounded-lg px-10 py-4 text-lg font-bold text-white hover:opacity-90"
                  style={{ background: INK }}
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t border-white/10 py-12 text-white"
        style={{ background: INK }}
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 md:grid-cols-4 md:px-16">
          <div className="flex flex-col gap-6">
            <div className="text-xl font-bold">ASU Portal</div>
            <p className="text-slate-400">
              Empowering academic excellence through structured knowledge and innovative digital
              tools.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-blue-600"
                aria-label="Website"
              >
                <Icon name="public" className="text-sm" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-blue-600"
                aria-label="Email"
              >
                <Icon name="alternate_email" className="text-sm" />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-bold">Academic Services</span>
            <Link to="/login" className="text-slate-400 hover:text-white">
              Dashboard
            </Link>
            <Link to="/register" className="text-slate-400 hover:text-white">
              Registration
            </Link>
            <Link to="/login" className="text-slate-400 hover:text-white">
              Results
            </Link>
            <Link to="/features" className="text-slate-400 hover:text-white">
              Announcements
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-bold">Security & Trust</span>
            <Link to="/about" className="text-slate-400 hover:text-white">
              About ASU
            </Link>
            <a href="#" className="text-slate-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white">
              Terms of Service
            </a>
            <Link to="/contact" className="text-slate-400 hover:text-white">
              Help Center
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-bold">Contact Us</span>
            <p className="text-slate-400">
              Analytical Scholar University
              <br />
              Academic Campus Road
              <br />
              contact@asu-portal.edu
            </p>
            <Link
              to="/contact"
              className="w-fit rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ background: PRIMARY }}
            >
              Contact Support
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[1280px] border-t border-white/10 px-4 pt-8 text-center md:px-16">
          <p className="text-xs text-slate-400">
            © 2024 Analytical Scholar University. Empowering Academic Excellence through Structured
            Knowledge.
          </p>
        </div>
      </footer>
    </div>
  );
}
