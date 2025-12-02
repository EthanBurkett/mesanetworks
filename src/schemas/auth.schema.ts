import z from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const createUserSchema = registerSchema.omit({ password: true }).extend({
  auth0Id: z.string().min(1, "Auth0 ID is required"),
  avatarUrl: z.string().url("Invalid URL").optional(),
});

export const loginSchema = z.object({
  identifier: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const sendCodeSchema = z.object({
  email: z.string().email(),
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(10),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type SendCodeSchema = z.infer<typeof sendCodeSchema>;
export type VerifyCodeSchema = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
