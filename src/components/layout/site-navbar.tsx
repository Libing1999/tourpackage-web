"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Menu, Search } from "lucide-react";

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
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300",
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b bg-background/80 shadow-[0_1px_12px_-6px_oklch(0.2_0.05_265/0.12)] backdrop-blur-md supports-backdrop-filter:bg-background/70"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* next/link keeps navigation client-side — switching pages swaps the
            content in place without a full document reload. */}
        <Link href="/" className="rounded-md transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <Logo className={cn(overlay && "text-white")} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // The underline grows from the centre on hover and stays
                  // drawn for the current section.
                  "relative py-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:transition-transform after:duration-300 after:ease-out-soft hover:after:scale-x-100",
                  active && "after:scale-x-100",
                  overlay
                    ? "text-white/85 after:bg-white hover:text-white"
                    : cn(
                        "after:bg-primary hover:text-foreground",
                        active ? "text-foreground" : "text-muted-foreground"
                      )
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn("hidden items-center gap-2 md:flex", overlay && "text-white")}>
          <ThemeToggle />
        </div>

        <div className={cn("flex items-center gap-1 md:hidden", overlay && "text-white")}>
          {/* On phones the hero drops its search bar; this icon replaces it. */}
          {pathname === "/" ? <MobileSearch /> : null}
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
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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

/** The hero's destination search, opened from an icon in the mobile navbar.
 * Hands off to the package listing exactly as the hero's search bar does. */
function MobileSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = term.trim();
    setOpen(false);
    router.push(q ? `/packages?q=${encodeURIComponent(q)}` : "/packages");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" />}>
        <Search className="size-5" />
        <span className="sr-only">Search</span>
      </SheetTrigger>
      <SheetContent side="top" className="p-4 pt-14">
        <SheetTitle className="sr-only">Search</SheetTitle>
        <form
          onSubmit={onSearch}
          role="search"
          className="flex w-full flex-col gap-2 rounded-2xl border bg-background p-2 focus-within:ring-4 focus-within:ring-primary/20"
        >
          <div className="flex flex-1 items-center gap-2.5 px-3">
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search destinations, tours, or hotels"
              aria-label="Search destinations, tours, or hotels"
              className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none active:scale-[0.98] dark:bg-[oklch(0.34_0.13_265)] dark:text-white dark:hover:bg-[oklch(0.3_0.12_265)]"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
