import { z } from "zod";

// Mirrors the backend's GuestDetailsRequest / TravellerRequest /
// CreateHotelBookingRequest constraints so a booking that passes here is
// never rejected server-side for a rule the guest wasn't shown.
const PHONE_REGEX = /^[+0-9()\-\s]{6,20}$/;

export const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;

export const PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "BANK_TRANSFER",
  "CASH",
  "WALLET",
] as const;

export const staySchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    // Plain z.number() rather than z.coerce.number(): the number inputs are
    // registered with RHF's valueAsNumber, so the value reaching zod is already
    // a number. z.coerce would type its input as `unknown` and break the
    // resolver's generic.
    numberOfAdults: z
      .number({ message: "Enter a number" })
      .int()
      .min(1, "At least one adult is required"),
    numberOfChildren: z.number({ message: "Enter a number" }).int().min(0, "Cannot be negative"),
  })
  .refine((v) => new Date(v.checkOutDate) > new Date(v.checkInDate), {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  })
  .refine((v) => new Date(v.checkInDate) >= new Date(new Date().toDateString()), {
    message: "Check-in cannot be in the past",
    path: ["checkInDate"],
  });

export type StayFormValues = z.infer<typeof staySchema>;

/** Package equivalent of {@link staySchema}: only a departure date, since the
 * package's own duration fixes the return. */
export const packageTripSchema = z
  .object({
    travelDate: z.string().min(1, "Travel date is required"),
    numberOfAdults: z
      .number({ message: "Enter a number" })
      .int()
      .min(1, "At least one adult is required"),
    numberOfChildren: z.number({ message: "Enter a number" }).int().min(0, "Cannot be negative"),
  })
  .refine((v) => new Date(v.travelDate) >= new Date(new Date().toDateString()), {
    message: "Travel date cannot be in the past",
    path: ["travelDate"],
  });

export type PackageTripFormValues = z.infer<typeof packageTripSchema>;

export const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "At most 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "At most 100 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address").max(255),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(20, "At most 20 characters")
    .regex(PHONE_REGEX, "Enter a valid phone number"),
});

export type GuestFormValues = z.infer<typeof guestSchema>;

export const travellerSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(150, "At most 150 characters"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(GENDERS).optional().or(z.literal("")),
  passportNumber: z.string().max(50, "At most 50 characters").optional().or(z.literal("")),
});

export const travellersSchema = z.object({
  travellers: z.array(travellerSchema).min(1, "At least one traveller is required"),
});

export type TravellersFormValues = z.infer<typeof travellersSchema>;

export const paymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  specialRequests: z.string().max(1000, "At most 1000 characters").optional().or(z.literal("")),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const bookingLookupSchema = z.object({
  bookingNumber: z.string().min(1, "Booking number is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type BookingLookupFormValues = z.infer<typeof bookingLookupSchema>;
