import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[a-z]/, "At least one lowercase letter")
  .regex(/[0-9]/, "At least one number");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name required").max(120),
    email: z.string().trim().email("Invalid email").max(255),
    phone: z.string().trim().min(7, "Phone required").max(20),
    facultyId: z.string().uuid("Select a faculty"),
    departmentId: z.string().uuid("Select a department"),
    level: z
      .number()
      .int()
      .refine((n) => [100, 200, 300, 400, 500].includes(n), "Invalid level"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const studentLoginSchema = z.object({
  matricNumber: z
    .string()
    .trim()
    .regex(/^\d{6}0209$/, "Invalid matric number"),
  password: z.string().min(1, "Password required"),
});

export const adminUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^asu[a-z0-9_]+$/, "Username must start with 'asu'"),
});

export const adminPasswordSchema = z.object({
  username: z.string(),
  password: z.string().min(1, "Password required"),
});

export const matricSchema = z
  .string()
  .trim()
  .regex(/^\d{6}0209$/, "Matric must be 10 digits ending in 0209");
