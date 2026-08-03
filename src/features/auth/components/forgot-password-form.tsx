"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage } from "@/utils/errors";
import { useForgotPasswordMutation } from "../hooks/use-auth";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => setSubmittedEmail(values.email),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  if (submittedEmail) {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If an account exists for <strong>{submittedEmail}</strong>, a password reset link is on its
          way.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@tourpackage.com"
          aria-invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
        {forgotPasswordMutation.isPending ? <Spinner /> : null}
        Send reset link
      </Button>
    </form>
  );
}
