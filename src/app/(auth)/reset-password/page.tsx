import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Spinner } from "@/components/common/spinner";

export const metadata: Metadata = {
  // Crawlable but not indexable, deliberately. robots.txt no longer disallows
  // these: a Disallow would stop a crawler fetching the page, and a noindex it
  // cannot fetch is a noindex it never reads.
  robots: { index: false, follow: false },
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
