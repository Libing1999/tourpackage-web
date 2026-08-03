"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import {
  guestSchema,
  paymentSchema,
  travellersSchema,
  type GuestFormValues,
  type PaymentFormValues,
  type TravellersFormValues,
} from "../schemas";
import type { Gender } from "../types";

/**
 * The guest / travellers / payment steps are identical between the hotel and
 * package flows, so their forms are created here once rather than declared
 * twice. Each flow still owns its own first step, which is where they actually
 * differ.
 */
export function useBookingForms() {
  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  const travellersForm = useForm<TravellersFormValues>({
    resolver: zodResolver(travellersSchema),
    defaultValues: {
      travellers: [{ fullName: "", dateOfBirth: "", gender: "", passportNumber: "" }],
    },
  });

  const travellerFields = useFieldArray({
    control: travellersForm.control,
    name: "travellers",
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMethod: "CREDIT_CARD", specialRequests: "" },
  });

  /** Shapes the traveller rows for the API: blank optional fields become null,
   * and the first traveller is always the lead (matching the backend's own
   * default when none is nominated). */
  const travellersPayload = () =>
    travellersForm.getValues("travellers").map((t, i) => ({
      fullName: t.fullName,
      dateOfBirth: t.dateOfBirth || null,
      gender: (t.gender || null) as Gender | null,
      passportNumber: t.passportNumber || null,
      isLeadTraveller: i === 0,
    }));

  return { guestForm, travellersForm, travellerFields, paymentForm, travellersPayload };
}

/**
 * Routes a failed submit back to the step that owns the offending field, so a
 * server-side validation error lands on an input the user can actually see.
 * Returns the step index to jump to, or null if it was only worth a toast.
 */
export function routeSubmitError(
  error: unknown,
  guestForm: ReturnType<typeof useBookingForms>["guestForm"],
  onDateError: (fieldErrors: Record<string, string>) => boolean
): number | null {
  const fieldErrors = getFieldErrors(error);

  if (fieldErrors) {
    const guestField = Object.keys(fieldErrors).find((k) => k.startsWith("guest."));
    if (guestField) {
      guestForm.setError(guestField.replace("guest.", "") as keyof GuestFormValues, {
        message: fieldErrors[guestField],
      });
      return 1;
    }
    if (onDateError(fieldErrors)) {
      return 0;
    }
  }

  toast.error(getErrorMessage(error));
  return null;
}
