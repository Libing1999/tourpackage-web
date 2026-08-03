"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/common/spinner";
import { getAccessToken } from "@/services/api-client";
import { useProfileQuery } from "../hooks/use-auth";

/**
 * Wraps every dashboard route. Tokens live in localStorage only (no
 * server-readable cookie), so this can't be enforced in middleware — the
 * check has to happen client-side, which means a real session still shows a
 * brief "checking session" spinner on first paint/SSR before the client can
 * read localStorage. See GuestGuard for the inverse.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasToken = !!getAccessToken();
  const { data: admin, isPending, isError } = useProfileQuery();

  useEffect(() => {
    if (!hasToken || isError) {
      router.replace("/login");
    }
  }, [hasToken, isError, router]);

  if (!hasToken || isPending || isError || !admin) {
    return <FullPageSpinner label="Checking your session..." />;
  }

  return <>{children}</>;
}
