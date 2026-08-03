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
    <Card className="flex h-full flex-col justify-between p-6">
      <Quote className="size-6 text-primary/40" />
      <CardContent className="flex-1 p-0">
        <p className="mt-3 text-sm text-muted-foreground">&ldquo;{testimonial.message}&rdquo;</p>
      </CardContent>
      <div className="mt-5 flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
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
