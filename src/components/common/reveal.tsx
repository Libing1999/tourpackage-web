"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

export type RevealDirection = "up" | "left" | "right" | "none";

// Where the element starts before it settles into place. Distances stay small
// (24px) so the motion reads as polish rather than movement.
const HIDDEN_OFFSET: Record<RevealDirection, string> = {
  up: "translate-y-6",
  left: "-translate-x-6",
  right: "translate-x-6",
  none: "",
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  /** The side the content slides in from; `up` rises from below. */
  direction?: RevealDirection;
  /** Element to render, so a revealed block can stay a semantic section. */
  as?: "div" | "section" | "aside" | "li";
}

/**
 * Fades and slides its children in the first time they scroll into view, and
 * never again. Under prefers-reduced-motion the content is simply visible.
 */
export function Reveal({ children, className, delayMs = 0, direction = "up", as = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-out-soft motion-reduce:translate-none motion-reduce:opacity-100",
        inView ? "translate-none opacity-100" : cn("opacity-0", HIDDEN_OFFSET[direction]),
        className
      )}
      style={{ transitionDelay: inView ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
