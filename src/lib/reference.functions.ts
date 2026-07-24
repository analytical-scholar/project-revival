import { createServerFn } from "@tanstack/react-start";

export interface FacultyItem {
  id: string;
  name: string;
}

export interface DepartmentItem {
  id: string;
  faculty_id: string;
  name: string;
}

export const FALLBACK_FACULTIES: FacultyItem[] = [
  { id: "11111111-1111-4111-a111-111111111111", name: "Faculty of Arts & Humanities" },
  { id: "22222222-2222-4222-a222-222222222222", name: "Faculty of Natural & Applied Sciences" },
  { id: "33333333-3333-4333-a333-333333333333", name: "Faculty of Social & Management Sciences" },
  { id: "44444444-4444-4444-a444-444444444444", name: "Faculty of Engineering & Technology" },
  { id: "55555555-5555-4555-a555-555555555555", name: "Faculty of Law" },
  { id: "66666666-6666-4666-a666-666666666666", name: "Faculty of Medical & Health Sciences" },
  { id: "77777777-7777-4777-a777-777777777777", name: "Faculty of Environmental Sciences" },
  { id: "88888888-8888-4888-a888-888888888888", name: "Faculty of Education" },
];

export const FALLBACK_DEPARTMENTS: DepartmentItem[] = [
  // Arts & Humanities
  {
    id: "10000001-0000-4000-a000-000000000001",
    faculty_id: "11111111-1111-4111-a111-111111111111",
    name: "English & Literary Studies",
  },
  {
    id: "10000002-0000-4000-a000-000000000002",
    faculty_id: "11111111-1111-4111-a111-111111111111",
    name: "History & International Studies",
  },
  {
    id: "10000003-0000-4000-a000-000000000003",
    faculty_id: "11111111-1111-4111-a111-111111111111",
    name: "Philosophy",
  },
  {
    id: "10000004-0000-4000-a000-000000000004",
    faculty_id: "11111111-1111-4111-a111-111111111111",
    name: "Performing Arts & Music",
  },
  {
    id: "10000005-0000-4000-a000-000000000005",
    faculty_id: "11111111-1111-4111-a111-111111111111",
    name: "Linguistics & Languages",
  },

  // Natural & Applied Sciences
  {
    id: "20000001-0000-4000-a000-000000000001",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Computer Science",
  },
  {
    id: "20000002-0000-4000-a000-000000000002",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Cyber Security",
  },
  {
    id: "20000003-0000-4000-a000-000000000003",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Biochemistry",
  },
  {
    id: "20000004-0000-4000-a000-000000000004",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Microbiology",
  },
  {
    id: "20000005-0000-4000-a000-000000000005",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Physics & Electronics",
  },
  {
    id: "20000006-0000-4000-a000-000000000006",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Industrial Chemistry",
  },
  {
    id: "20000007-0000-4000-a000-000000000007",
    faculty_id: "22222222-2222-4222-a222-222222222222",
    name: "Mathematics & Statistics",
  },

  // Social & Management Sciences
  {
    id: "30000001-0000-4000-a000-000000000001",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Business Administration",
  },
  {
    id: "30000002-0000-4000-a000-000000000002",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Accounting",
  },
  {
    id: "30000003-0000-4000-a000-000000000003",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Economics",
  },
  {
    id: "30000004-0000-4000-a000-000000000004",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Mass Communication",
  },
  {
    id: "30000005-0000-4000-a000-000000000005",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Political Science & Public Administration",
  },
  {
    id: "30000006-0000-4000-a000-000000000006",
    faculty_id: "33333333-3333-4333-a333-333333333333",
    name: "Sociology & Criminology",
  },

  // Engineering & Technology
  {
    id: "40000001-0000-4000-a000-000000000001",
    faculty_id: "44444444-4444-4444-a444-444444444444",
    name: "Software Engineering",
  },
  {
    id: "40000002-0000-4000-a000-000000000002",
    faculty_id: "44444444-4444-4444-a444-444444444444",
    name: "Electrical & Electronics Engineering",
  },
  {
    id: "40000003-0000-4000-a000-000000000003",
    faculty_id: "44444444-4444-4444-a444-444444444444",
    name: "Mechanical Engineering",
  },
  {
    id: "40000004-0000-4000-a000-000000000004",
    faculty_id: "44444444-4444-4444-a444-444444444444",
    name: "Civil & Environmental Engineering",
  },

  // Law
  {
    id: "50000001-0000-4000-a000-000000000001",
    faculty_id: "55555555-5555-4555-a555-555555555555",
    name: "Public & Private Law",
  },
  {
    id: "50000002-0000-4000-a000-000000000002",
    faculty_id: "55555555-5555-4555-a555-555555555555",
    name: "Commercial & Property Law",
  },

  // Medical & Health Sciences
  {
    id: "60000001-0000-4000-a000-000000000001",
    faculty_id: "66666666-6666-4666-a666-666666666666",
    name: "Nursing Science",
  },
  {
    id: "60000002-0000-4000-a000-000000000002",
    faculty_id: "66666666-6666-4666-a666-666666666666",
    name: "Medical Laboratory Science",
  },
  {
    id: "60000003-0000-4000-a000-000000000003",
    faculty_id: "66666666-6666-4666-a666-666666666666",
    name: "Public Health",
  },

  // Environmental Sciences
  {
    id: "70000001-0000-4000-a000-000000000001",
    faculty_id: "77777777-7777-4777-a777-777777777777",
    name: "Architecture",
  },
  {
    id: "70000002-0000-4000-a000-000000000002",
    faculty_id: "77777777-7777-4777-a777-777777777777",
    name: "Estate Management",
  },
  {
    id: "70000003-0000-4000-a000-000000000003",
    faculty_id: "77777777-7777-4777-a777-777777777777",
    name: "Quantity Surveying",
  },

  // Education
  {
    id: "80000001-0000-4000-a000-000000000001",
    faculty_id: "88888888-8888-4888-a888-888888888888",
    name: "Educational Management",
  },
  {
    id: "80000002-0000-4000-a000-000000000002",
    faculty_id: "88888888-8888-4888-a888-888888888888",
    name: "Guidance & Counselling",
  },
];

export const listFaculties = createServerFn({ method: "GET" }).handler(
  async (): Promise<FacultyItem[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("faculties").select("id, name").order("name");
    if (error) throw new Error(error.message);
    return (data as FacultyItem[]) ?? [];
  },
);

export const listDepartments = createServerFn({ method: "GET" }).handler(
  async (): Promise<DepartmentItem[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("id, faculty_id, name")
      .order("name");
    if (error) throw new Error(error.message);
    return (data as DepartmentItem[]) ?? [];
  },
);
