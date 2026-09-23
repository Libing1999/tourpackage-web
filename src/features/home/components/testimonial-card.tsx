import Image from "next/image";
import { Quote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/common/star-rating";
import { cn } from "@/lib/utils";
import type { Testimonial } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  /** The lead review of a section: set as a large pull quote. */
  featured?: boolean;
}

export function TestimonialCard({ testimonial, featured = false }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "relative h-full justify-between gap-0 rounded-2xl ring-foreground/[0.07] transition-[translate,box-shadow] duration-300 ease-out-soft",
        featured
          ? "bg-secondary/70 p-7 sm:p-10"
          : "p-6 shadow-card hover:-translate-y-1 hover:shadow-card-hover"
      )}
    >
      <Quote
        className={cn(
          "text-primary/25",
          featured ? "absolute right-6 bottom-6 size-16 text-primary/15 sm:right-8 sm:bottom-8 sm:size-24" : "size-7"
        )}
        aria-hidden="true"
      />
      {featured ? <StarRating rating={testimonial.rating} /> : null}
      {/* A featured card stretches to match its neighbours; centring the quote
          splits the extra height above and below it instead of leaving it all
          in one gap. */}
      <CardContent className={cn("flex-1 p-0", featured && "flex items-center py-8")}>
        <blockquote
          className={cn(
            featured
              ? "max-w-2xl text-xl leading-snug font-medium tracking-tight text-foreground sm:text-2xl lg:text-[1.75rem]"
              : "mt-4 text-sm leading-relaxed text-muted-foreground"
          )}
        >
          &ldquo;{testimonial.message}&rdquo;
        </blockquote>
      </CardContent>
      <div className={cn("flex items-center gap-3", featured ? "pr-24" : "mt-6 border-t pt-5")}>
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary ring-2 ring-background",
            featured ? "size-12" : "size-10"
          )}
        >
          {testimonial.customerAvatarUrl ? (
            <Image
              src={testimonial.customerAvatarUrl}
              alt={testimonial.customerName}
              fill
              sizes={featured ? "48px" : "40px"}
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-medium">
              {initials(testimonial.customerName)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{testimonial.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {testimonial.customerCountryName}
            {testimonial.packageTitle ? ` · ${testimonial.packageTitle}` : ""}
          </p>
        </div>
        {featured ? null : <StarRating rating={testimonial.rating} className="ml-auto shrink-0" />}
      </div>
    </Card>
  );
}
