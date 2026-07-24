# Phase 1 — ASU Student Portal Foundation

A production-ready university portal on TanStack Start + Supabase (Lovable Cloud).

Note on stack: the project is already scaffolded on **TanStack Start** (not Vite + React Router). All requested libraries (Tailwind, React Hook Form, Framer Motion, Lucide, react-hot-toast) work here. I'll use TanStack Router file-based routing instead of react-router-dom — everything else in the spec is unchanged.

## 1. Design system

- Poppins via `<link>` in `__root.tsx`
- Tokens in `src/styles.css`: primary `#2563EB`, background `#F8FAFC`, card white, soft shadows, rounded-2xl
- Light mode only
- Toaster (react-hot-toast) mounted in root

## 2. Database schema (single migration)

Tables + RLS + GRANTs:

- `faculties` (id, name) — public read
- `departments` (id, faculty_id, name) — public read
- `pending_registrations` (id, full_name, email unique, phone, faculty_id, department_id, level, password_hash, status enum[pending/approved/rejected], rejection_reason, created_at)
- `students` (id = auth.users.id, matric_number unique 10-digit ending 0209, full_name, email, phone, faculty_id, department_id, level, status enum[active/suspended], created_at)
- `admins` (id = auth.users.id, username unique starts with `asu`, role enum, created_at)
- `app_role` enum: super_admin, admissions_officer, academic_officer, communications_officer
- `has_role(uuid, app_role)` security-definer fn
- `courses`, `course_registrations`, `results`, `announcements`, `notifications`, `academic_sessions`, `semesters`, `audit_logs` — created with base columns + RLS scaffolding (Phase 1 seeds structure; Phase 2+ implements flows)
- `login_attempts` (email/username, count, locked_until) — for lockout
- Trigger to auto-generate matric on approval when not provided (10 digits ending `0209`, unique)

Seed: faculties + departments per spec.

## 3. Authentication

- **Public registration**: writes to `pending_registrations` only (no auth user yet). Password is hashed server-side (bcrypt) and stored on the pending row; on approval a real Supabase auth user is created with that hash migrated via `admin.createUser`. Alternative: create auth user immediately in disabled state — I'll use the create-on-approval flow to keep pending accounts out of `auth.users`.
- **Student login**: matric_number + password → server fn looks up email from `students` by matric → signs in via Supabase.
- **Admin login**: `/admin/login` two-step (username → password). Username → server fn resolves admin email → password step signs in.
- Lockout: 5 failed → 15 min, tracked in `login_attempts`.
- Forgot password: `supabase.auth.resetPasswordForEmail` + `/reset-password` route.

## 4. Routes (TanStack file-based)

Public:

- `/` landing (hero + nav + footer)
- `/about`, `/features`, `/contact`
- `/login` (student), `/register`, `/registration-submitted`
- `/admin/login`
- `/reset-password`

Protected under `_authenticated/`:

- `/dashboard` (student)
- `/admin` layout with role-gated children:
  - `/admin/dashboard`
  - `/admin/admissions` (approve/reject pending registrations) — admissions_officer + super_admin
  - `/admin/academics`, `/admin/communications` (stubs wired to role gates)

Role gate uses `has_role` via `requireSupabaseAuth` server fn on each admin child loader.

## 5. Approval workflow

Admin approval action (server fn, admissions_officer/super_admin):

1. Generate or accept matric (validate: 10 digits, ends `0209`, unique)
2. Create Supabase auth user with pending email + stored password hash
3. Insert into `students` (status active)
4. Update pending row → approved
5. Send approval email via Lovable managed auth email (custom template) — scaffold auth email templates so approval/rejection use branded transactional sender
6. Audit log entry

Rejection: update status + reason, send rejection email, audit log.

## 6. Emails

Scaffold transactional email templates (approval, rejection). Trigger from approval/reject server fns via `sendTemplateEmail`.

Email domain: I'll check status; if none, prompt setup dialog before scaffolding.

## 7. Security

- RLS on every table; students see only own rows; admins gated via `has_role`
- No plaintext passwords in client; bcrypt server-side for pending; Supabase Auth for active
- Service role key server-only (via `supabaseAdmin`, imported inside handlers)
- Admin routes both client-gated (`_authenticated`) and server-gated (role check in every admin server fn)

## 8. Deliverables this turn

- Migration (schema + RLS + GRANTs + seed + triggers + `has_role`)
- Design tokens + Poppins
- All public pages (landing, about, features, contact, login, register, registration-submitted, admin login, reset-password)
- Student dashboard shell
- Admin layout + admissions approval UI (fully functional)
- Auth server fns (student login, admin login step 1/2, register, approve, reject, lockout)
- Route protection (`_authenticated` + role gates)
- Email template scaffold + wired approval/rejection sends

Other admin dashboards (academic, communications) and course/result/announcement UIs get table scaffolding + placeholder routes now; full CRUD in Phase 2 per your spec ("Phase 1 Foundation").

---

Confirm and I'll build it in one pass. If you want the academic/communications/course modules **fully implemented** in Phase 1 too, say so and I'll expand scope.
