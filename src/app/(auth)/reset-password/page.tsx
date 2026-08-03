import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Spinner } from "@/components/common/spinner";

export const metadata: Metadata = {
  title: "Reset password — TourPackage",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset your password" description="Choose a new password for your account.">
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
