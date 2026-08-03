"use client";

import type { UseFormReturn } from "react-hook-form";
import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/common/spinner";
import { PAYMENT_METHODS, type GuestFormValues, type PaymentFormValues, type TravellersFormValues } from "../../schemas";
import type { PaymentMethod } from "../../types";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  PAYPAL: "PayPal",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Pay on arrival",
  WALLET: "Wallet",
};

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
      <h2 className="font-semibold text-foreground">Review &amp; payment</h2>

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
        <Label>Payment method</Label>
        <Select
          value={paymentForm.watch("paymentMethod")}
          onValueChange={(v) => paymentForm.setValue("paymentMethod", v as PaymentMethod)}
        >
          <SelectTrigger className="w-full" aria-label="Payment method">
            <SelectValue placeholder="Choose a payment method">
              {(value: PaymentMethod | null) =>
                value ? PAYMENT_LABELS[value] : "Choose a payment method"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {PAYMENT_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-dashed p-4">
        <CreditCard className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No payment is taken now — this is a placeholder while payment processing is being set up.
          Your booking will be held as <strong>pending</strong> and our team will contact you to
          arrange payment.
        </p>
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
