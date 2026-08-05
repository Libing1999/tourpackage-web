import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";

/**
 * Applies to every admin route, including `/profile`, which is a client
 * component and so cannot export metadata of its own.
 *
 * <p>These pages are noindex rather than robots.txt-disallowed. A Disallow stops
 * a crawler fetching the page, which also stops it reading the noindex — so a
 * URL linked from anywhere can still end up in the index, listed with no
 * description. Letting the crawler in to be told "no" is the reliable signal.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
