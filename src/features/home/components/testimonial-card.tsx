import Image from "next/image";
import { Quote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/common/star-rating";
import type { Testimonial } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex h-full flex-col justify-between gap-0 p-6 shadow-card ring-foreground/[0.06] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Quote className="size-5" />
      </span>
      <CardContent className="flex-1 p-0">
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{testimonial.message}&rdquo;</p>
      </CardContent>
      <div className="mt-6 flex items-center gap-3 border-t pt-5">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary ring-2 ring-background">
          {testimonial.customerAvatarUrl ? (
            <Image
              src={testimonial.customerAvatarUrl}
              alt={testimonial.customerName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-medium">
              {initials(testimonial.customerName)}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {testimonial.customerCountryName}
            {testimonial.packageTitle ? ` · ${testimonial.packageTitle}` : ""}
          </p>
        </div>
        <StarRating rating={testimonial.rating} className="ml-auto" />
      </div>
    </Card>
  );
}
