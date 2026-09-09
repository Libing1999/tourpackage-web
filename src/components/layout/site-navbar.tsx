"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSiteContent } from "@/features/cms/site-content-provider";
import { cn } from "@/lib/utils";

export function SiteNavbar() {
  // Links come from the CMS (nav_links, group HEADER). No local fallback list:
  // a hardcoded copy would drift from what an admin sees themselves editing.
  const navLinks = useSiteContent()?.header ?? [];
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the homepage has the full-screen hero for the bar to float over. There,
  // before the first scroll, the navbar is transparent with light text so it
  // blends into the landing image; once scrolled (or on any other page) it
  // becomes a solid, readable bar.
  const overlay = pathname === "/" && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-200",
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* next/link keeps navigation client-side — switching pages swaps the
            content in place without a full document reload. */}
        <Link href="/">
          <Logo className={cn(overlay && "text-white")} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                overlay
                  ? "text-white/85 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={cn("hidden items-center gap-2 md:flex", overlay && "text-white")}>
          <ThemeToggle />
        </div>

        <div className={cn("flex items-center gap-1 md:hidden", overlay && "text-white")}>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="flex-row items-center border-b">
                <Logo />
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.id}
                    render={
                      <Link
                        href={link.href}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        {link.label}
                      </Link>
                    }
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
