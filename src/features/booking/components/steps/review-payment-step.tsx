"use client";

import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/common/spinner";
import type { GuestFormValues, PaymentFormValues, TravellersFormValues } from "../../schemas";

interface ReviewPaymentStepProps {
  guestForm: UseFormReturn<GuestFormValues>;
  travellersForm: UseFormReturn<TravellersFormValues>;
  paymentForm: UseFormReturn<PaymentFormValues>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function ReviewPaymentStep({
  guestForm,
  travellersForm,
  paymentForm,
  onSubmit,
  isPending,
}: ReviewPaymentStepProps) {
  const travellers = travellersForm.getValues("travellers");

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <h2 className="font-semibold text-foreground">Review &amp; confirm</h2>

      <div className="rounded-xl border p-4 text-sm">
        <p className="font-medium text-foreground">
          {guestForm.getValues("firstName")} {guestForm.getValues("lastName")}
        </p>
        <p className="text-muted-foreground">{guestForm.getValues("email")}</p>
        <p className="text-muted-foreground">{guestForm.getValues("phone")}</p>
        <Separator className="my-3" />
        <p className="mb-1 font-medium text-foreground">
          {travellers.length} traveller{travellers.length !== 1 ? "s" : ""}
        </p>
        <ul className="text-muted-foreground">
          {travellers.map((t, i) => (
            <li key={i}>
              {t.fullName}
              {i === 0 ? " (lead)" : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialRequests">Special requests (optional)</Label>
        <Textarea
          id="specialRequests"
          rows={3}
          placeholder="Dietary requirements, accessibility needs, celebrations…"
          {...paymentForm.register("specialRequests")}
        />
        {paymentForm.formState.errors.specialRequests ? (
          <p className="text-sm text-destructive">
            {paymentForm.formState.errors.specialRequests.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Spinner /> : null}
        Confirm booking
      </Button>
    </form>
  );
}
