import { z } from "zod";

// Mirrors the backend's CreateInquiryRequest constraints so a message that
// passes here is never rejected server-side for a rule the visitor wasn't shown.
const PHONE_REGEX = /^$|^[+0-9()\-\s]{6,20}$/;

export const inquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "At most 150 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address").max(255),
  phone: z
    .string()
    .max(20, "At most 20 characters")
    .regex(PHONE_REGEX, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  travelDate: z.string().optional().or(z.literal("")),
  // Empty is valid — a general question has no party size — so this is a
  // string here and converted at submit rather than coerced by the resolver.
  partySize: z.string().optional().or(z.literal("")),
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message must be at most 5000 characters"),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
