"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { useCreateInquiry } from "../hooks/use-contact";
import { inquirySchema, type InquiryFormValues } from "../schemas";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface InquiryFormProps {
  /** Set when the visitor arrived from a package's "Ask about this trip"
   * link — sent along so the reply has context. */
  packageId?: string;
  packageTitle?: string;
}

export function InquiryForm({ packageId, packageTitle }: InquiryFormProps) {
  const createInquiry = useCreateInquiry();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      travelDate: "",
      partySize: "",
      message: packageTitle ? `I'd like to know more about ${packageTitle}.\n\n` : "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createInquiry.mutate(
      {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        travelDate: values.travelDate || null,
        partySize: values.partySize ? Number(values.partySize) : null,
        message: values.message,
        packageId: packageId ?? null,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message ?? "Message sent");
          form.reset();
          setSubmitted(true);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            for (const [field, message] of Object.entries(fieldErrors)) {
              if (field in form.getValues()) {
                form.setError(field as keyof InquiryFormValues, { message });
              }
            }
            return;
          }
          toast.error(getErrorMessage(error));
        },
      }
    );
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-500" />
        <p className="font-medium text-foreground">Thanks — your message is on its way.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We&apos;ve sent a confirmation to your inbox, and someone from the team will reply shortly.
        </p>
        <Button variant="outline" className="mt-2" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {packageTitle ? (
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Asking about <span className="font-medium text-foreground">{packageTitle}</span>
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...form.register("phone")}
          />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-travel-date">
            Travel date <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="contact-travel-date"
            type="date"
            min={todayIso()}
            aria-invalid={!!errors.travelDate}
            {...form.register("travelDate")}
          />
          {errors.travelDate ? (
            <p className="text-sm text-destructive">{errors.travelDate.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-party-size">
            Travellers <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="contact-party-size"
            type="number"
            min={1}
            aria-invalid={!!errors.partySize}
            {...form.register("partySize")}
          />
          {errors.partySize ? (
            <p className="text-sm text-destructive">{errors.partySize.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder="Tell us where you'd like to go, or ask us anything…"
          aria-invalid={!!errors.message}
          {...form.register("message")}
        />
        {errors.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="self-start" disabled={createInquiry.isPending}>
        {createInquiry.isPending ? <Spinner /> : <Send />}
        Send message
      </Button>
    </form>
  );
}
