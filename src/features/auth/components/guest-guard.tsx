"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/common/spinner";
import { getAccessToken } from "@/services/api-client";
import { useProfileQuery } from "../hooks/use-auth";

/**
 * Wraps login/forgot-password/reset-password so an already-authenticated
 * admin gets bounced to the dashboard instead of seeing the login form
 * again. Renders children immediately if there's no token at all — no
 * reason to block guests behind a network round trip.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasToken = !!getAccessToken();
  const { data: admin, isSuccess } = useProfileQuery();

  const alreadyAuthenticated = hasToken && isSuccess && !!admin;

  useEffect(() => {
    if (alreadyAuthenticated) {
      router.replace("/dashboard");
    }
  }, [alreadyAuthenticated, router]);

  if (alreadyAuthenticated) {
    return <FullPageSpinner label="Redirecting..." />;
  }

  return <>{children}</>;
}
