import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import type { HotelSummary } from "../types";

/** Premium (5★) and Budget (3★) are encoded in the star rating, so the star
 * filter doubles as a tier filter and the card can show the tier explicitly. */
function hotelTier(starRating: number | null): "Premium" | "Budget" | null {
  if (starRating == null) return null;
  if (starRating >= 5) return "Premium";
  if (starRating <= 3) return "Budget";
  return null;
}

export function HotelCard({ hotel }: { hotel: HotelSummary }) {
  const tier = hotelTier(hotel.starRating);

  return (
    // Same inset-photo frame as PackageCard, so listings of either read alike.
    <Card className="group h-full gap-0 rounded-2xl p-1.5 shadow-card ring-foreground/[0.07] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        {hotel.coverImageUrl ? (
          <Image
            src={hotel.coverImageUrl}
            alt={hotel.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
          />
        ) : null}
        {hotel.starRating ? (
          <Badge className="absolute top-2.5 left-2.5 gap-1 bg-background/95 font-semibold text-foreground shadow-sm">
            {hotel.starRating}
            <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="sr-only">star</span>
          </Badge>
        ) : null}
        {tier ? (
          <Badge
            className={cn(
              "absolute top-2.5 right-2.5 font-semibold shadow-sm",
              // Dark text on amber: white on amber-500 falls well short of 4.5:1.
              tier === "Premium" ? "bg-amber-400 text-amber-950" : "bg-secondary text-secondary-foreground"
            )}
          >
            {tier}
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 px-3 pt-3.5 pb-2.5">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden="true" />
          {hotel.cityName}, {hotel.countryName}
        </p>
        <h3 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {hotel.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-foreground">{hotel.ratingAverage.toFixed(1)}</span>
            <span>({hotel.ratingCount})</span>
          </div>
          {hotel.basePrice > 0 ? (
            <p className="text-xs text-muted-foreground">
              from{" "}
              <span className="text-lg font-bold tracking-tight text-primary">
                {formatCurrency(hotel.basePrice, hotel.currencyCode)}
              </span>
              <span className="text-muted-foreground">/night</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground">Rate on request</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
