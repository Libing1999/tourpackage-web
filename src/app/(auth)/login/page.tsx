import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in — TourPackage",
};

export default function LoginPage() {
  return (
    <AuthCard title="Admin log in" description="Sign in to manage TourPackage.">
      <LoginForm />
    </AuthCard>
  );
}
