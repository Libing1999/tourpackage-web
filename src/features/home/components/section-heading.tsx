"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/common/reveal";
import { buttonVariants } from "@/components/ui/button";
import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useBlock } from "@/features/cms/site-content-provider";
import { cn } from "@/lib/utils";

type HeadingTone = "default" | "inverse";

interface SectionHeadingProps {
  blockKey: string;
  /** `start` lines the copy up with the content edge and makes room for `action`. */
  align?: "center" | "start";
  /** `inverse` is for copy set on the dark ink band. */
  tone?: HeadingTone;
  /** Rendered opposite the copy on wide screens, under it on narrow ones. */
  action?: ReactNode;
  className?: string;
}

/**
 * Pulls its own copy from the CMS by key, so a section renders
 * `<SectionHeading blockKey="home.hotels" />` and nothing about the wording
 * lives in the component.
 *
 * <p>Renders no copy when the block is missing or inactive — deactivating a
 * block in the CMS hides its heading, and an unreachable CMS degrades to no
 * heading rather than to stale copy baked into the bundle. The action, which
 * is navigation rather than copy, still renders.
 */
export function SectionHeading({
  blockKey,
  align = "center",
  tone = "default",
  action,
  className,
}: SectionHeadingProps) {
  const block = useBlock(blockKey);
  const hasCopy = !!block && (!!block.title || !!block.eyebrow);
  const inverse = tone === "inverse";

  if (!hasCopy) {
    return action ? <div className={cn("flex justify-end", className)}>{action}</div> : null;
  }

  const copy = (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {block.eyebrow ? (
        <p
          className={cn(
            "inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] uppercase",
            inverse ? "text-ink-foreground/75" : "text-primary"
          )}
        >
          <span className="h-px w-6 bg-amber-500" aria-hidden="true" />
          {block.eyebrow}
        </p>
      ) : null}
      {block.title ? (
        <h2
          className={cn(
            "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl",
            inverse ? "text-ink-foreground" : "text-foreground"
          )}
        >
          {block.title}
        </h2>
      ) : null}
      {block.subtitle ? (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            inverse ? "text-ink-foreground/75" : "text-muted-foreground"
          )}
        >
          {block.subtitle}
        </p>
      ) : null}
    </div>
  );

  if (!action) {
    return <Reveal className={className}>{copy}</Reveal>;
  }

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      {copy}
      <div className="flex shrink-0 items-center gap-2">{action}</div>
    </Reveal>
  );
}

/** The "see everything" link a section header carries, pointing at a listing page. */
export function SectionLink({
  href,
  children,
  tone = "default",
}: {
  href: string;
  children: ReactNode;
  tone?: HeadingTone;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "group/link h-10 rounded-full px-4 has-data-[icon=inline-end]:pr-3.5",
        tone === "inverse" &&
          "border-ink-foreground/25 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground dark:border-ink-foreground/25 dark:bg-transparent dark:hover:bg-ink-foreground/10"
      )}
    >
      {children}
      <ArrowRight
        data-icon="inline-end"
        className="transition-transform duration-200 ease-out-soft group-hover/link:translate-x-0.5"
      />
    </Link>
  );
}

/**
 * Previous/next buttons for a carousel whose controls sit in the section
 * header instead of floating over the slides. Must render inside <Carousel>.
 */
export function CarouselControls({ tone = "default" }: { tone?: HeadingTone }) {
  const className = cn(
    "static size-11 translate-none",
    tone === "inverse" &&
      "border-ink-foreground/25 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground dark:border-ink-foreground/25 dark:bg-transparent dark:hover:bg-ink-foreground/10"
  );

  return (
    <>
      <CarouselPrevious className={className} />
      <CarouselNext className={className} />
    </>
  );
}
