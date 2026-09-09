"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Mail, Phone, Send, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/common/spinner";
import { cn } from "@/lib/utils";
import { getErrorMessage, getFieldErrors } from "@/utils/errors";
import { useCreateInquiry } from "../hooks/use-contact";
import { inquirySchema, type InquiryFormValues } from "../schemas";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Label with a required asterisk or an "(optional)" hint. */
function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm">
      {children}{" "}
      {required ? (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      ) : (
        <span className="font-normal text-muted-foreground">(optional)</span>
      )}
    </Label>
  );
}

/** An input with a leading icon and taller, form-friendly sizing. */
function IconInput({
  icon: Icon,
  className,
  ...props
}: ComponentProps<typeof Input> & { icon: typeof User }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("h-11 pl-9", className)} {...props} />
    </div>
  );
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
        phone: values.phone,
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

      {/* Your details */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your details
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-name" required>
              Name
            </FieldLabel>
            <IconInput
              icon={User}
              id="contact-name"
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...form.register("name")}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-email" required>
              Email
            </FieldLabel>
            <IconInput
              icon={Mail}
              id="contact-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-phone" required>
            Phone
          </FieldLabel>
          <IconInput
            icon={Phone}
            id="contact-phone"
            type="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...form.register("phone")}
          />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>
      </fieldset>

      {/* Trip details */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trip details
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-travel-date">Travel date</FieldLabel>
            <IconInput
              icon={CalendarDays}
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
            <FieldLabel htmlFor="contact-party-size">Travellers</FieldLabel>
            <IconInput
              icon={Users}
              id="contact-party-size"
              type="number"
              min={1}
              placeholder="e.g. 2"
              aria-invalid={!!errors.partySize}
              {...form.register("partySize")}
            />
            {errors.partySize ? (
              <p className="text-sm text-destructive">{errors.partySize.message}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="contact-message" required>
          Message
        </FieldLabel>
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

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto sm:self-start"
        disabled={createInquiry.isPending}
      >
        {createInquiry.isPending ? <Spinner /> : <Send />}
        Send message
      </Button>
    </form>
  );
}
