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
    <Card className="group h-full gap-0 overflow-hidden py-0 shadow-card ring-foreground/[0.06] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {hotel.coverImageUrl ? (
          <Image
            src={hotel.coverImageUrl}
            alt={hotel.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        {hotel.starRating ? (
          <Badge className="absolute left-3 top-3 gap-1 shadow-sm">
            {hotel.starRating} <Star className="size-3 fill-current" />
          </Badge>
        ) : null}
        {tier ? (
          <Badge
            className={cn(
              "absolute right-3 top-3 shadow-sm",
              tier === "Premium"
                ? "bg-amber-500 text-white"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {tier}
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <h3 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {hotel.cityName}, {hotel.countryName}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-dashed pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{hotel.ratingAverage.toFixed(1)}</span>
            <span>({hotel.ratingCount})</span>
          </div>
          {hotel.basePrice > 0 ? (
            <p className="text-sm text-muted-foreground">
              from{" "}
              <span className="text-base font-bold text-primary">
                {formatCurrency(hotel.basePrice, hotel.currencyCode)}
              </span>
              /night
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground">Rate on request</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
