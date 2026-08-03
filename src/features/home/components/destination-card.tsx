import Image from "next/image";
import { MapPin } from "lucide-react";

import type { Destination } from "../types";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <a
      href={`#packages`}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl"
    >
      {destination.imageUrl ? (
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="size-full bg-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
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
