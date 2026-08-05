import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  // Crawlable but not indexable, deliberately. robots.txt no longer disallows
  // these: a Disallow would stop a crawler fetching the page, and a noindex it
  // cannot fetch is a noindex it never reads.
  robots: { index: false, follow: false },
  title: "Log in — TourPackage",
};

export default function LoginPage() {
  return (
    <AuthCard title="Admin log in" description="Sign in to manage TourPackage.">
      <LoginForm />
    </AuthCard>
  );
}
