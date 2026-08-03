import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SiteContentProvider } from "@/features/cms/site-content-provider";
import type { SiteContent } from "@/features/cms/types";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({
  children,
  siteContent,
}: {
  children: ReactNode;
  siteContent: SiteContent | null;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SiteContentProvider value={siteContent}>
          {children}
          <Toaster richColors position="top-right" />
        </SiteContentProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
