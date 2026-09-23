import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Destination } from "../types";

interface DestinationCardProps {
  destination: Destination;
  /** The lead tile of a mosaic: larger type, and a larger image request. */
  featured?: boolean;
  /** Sizing is left to the grid the card sits in. */
  className?: string;
}

export function DestinationCard({ destination, featured = false, className }: DestinationCardProps) {
  return (
    <a
      href={`#packages`}
      className={cn(
        "group relative block size-full overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/[0.06] transition-[box-shadow] duration-300 ease-out-soft hover:shadow-card-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      {destination.imageUrl ? (
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.05_265/0.85)] via-[oklch(0.16_0.05_265/0.15)] via-45% to-transparent" />

      {/* Arrow chip: the tile's affordance, drawn in on hover or keyboard focus. */}
      <span
        className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white text-primary opacity-0 shadow-sm transition-[opacity,translate] duration-300 ease-out-soft group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 translate-x-1 sm:top-4 sm:right-4"
        aria-hidden="true"
      >
        <ArrowUpRight className="size-4" />
      </span>

      <div className={cn("absolute inset-x-0 bottom-0 text-white", featured ? "p-5 sm:p-7" : "p-4 sm:p-5")}>
        <p className="flex items-center gap-1 text-xs font-medium text-white/80">
          <MapPin className="size-3" aria-hidden="true" />
          {destination.countryName}
        </p>
        <h3
          className={cn(
            "mt-1 font-semibold tracking-tight",
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          )}
        >
          {destination.name}
        </h3>
        <p className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/20">
          {destination.packageCount} {destination.packageCount === 1 ? "package" : "packages"}
        </p>
      </div>
    </a>
  );
}
