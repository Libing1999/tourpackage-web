import type { ReactNode } from "react";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { GuestGuard } from "@/features/auth/components/guest-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-svh flex-col bg-muted/30 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.17_262/0.08),transparent_60%)]">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center p-4 pb-16">{children}</main>
      </div>
    </GuestGuard>
  );
}
