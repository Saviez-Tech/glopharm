import { z } from "zod";

export const resetPasswordSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(4, "OTP must be at least 4 digits")
    .max(16, "OTP is too long"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  referralCode: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
