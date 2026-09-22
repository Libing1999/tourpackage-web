import Image from "next/image";
import { MapPin } from "lucide-react";

import type { Destination } from "../types";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <a
      href={`#packages`}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-card transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {destination.imageUrl ? (
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
        />
      ) : (
        <div className="size-full bg-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.05_265/0.9)] via-black/10 to-transparent transition-opacity duration-300" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-transform duration-500 ease-out-soft group-hover:-translate-y-1 sm:p-5">
        <h3 className="text-lg font-semibold">{destination.name}</h3>
        <p className="flex items-center gap-1 text-xs text-white/80">
          <MapPin className="size-3" />
          {destination.countryName}
        </p>
        <p className="mt-1 text-xs text-white/70">
          {destination.packageCount} {destination.packageCount === 1 ? "package" : "packages"}
        </p>
      </div>
    </a>
  );
}
