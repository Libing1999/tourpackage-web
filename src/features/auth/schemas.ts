import { z } from "zod";

// Mirrors the backend's ResetPasswordRequest regex exactly (see
// tourpackage-api dto/request/ResetPasswordRequest.java) so the client
// rejects a weak password before ever hitting the network.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,100}$/;
const PASSWORD_MESSAGE =
  "Must be 8-100 characters with an uppercase letter, a lowercase letter, a digit, and a special character (@$!%*?&#)";

const PHONE_REGEX = /^$|^[+0-9()\-\s]{6,20}$/;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1, "New password is required").regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(150, "Full name must be at most 150 characters"),
  phone: z
    .string()
    .max(20, "Phone must be at most 20 characters")
    .regex(PHONE_REGEX, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .max(2048, "Avatar URL must be at most 2048 characters")
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
