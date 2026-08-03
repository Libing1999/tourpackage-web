"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/password-input";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage } from "@/utils/errors";
import { useResetPasswordMutation } from "../hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Invalid reset link</AlertTitle>
        <AlertDescription>
          This link is missing its reset token. Request a new one from the{" "}
          <Link href="/forgot-password" className="underline">
            forgot password
          </Link>{" "}
          page.
        </AlertDescription>
      </Alert>
    );
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Password reset</AlertTitle>
          <AlertDescription>You can now log in with your new password.</AlertDescription>
        </Alert>
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Go to log in
        </Link>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    resetPasswordMutation.mutate(
      { token, newPassword: values.newPassword },
      {
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          aria-invalid={!!form.formState.errors.newPassword}
          {...form.register("newPassword")}
        />
        {form.formState.errors.newPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!form.formState.errors.confirmPassword}
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
        {resetPasswordMutation.isPending ? <Spinner /> : null}
        Reset password
      </Button>
    </form>
  );
}
