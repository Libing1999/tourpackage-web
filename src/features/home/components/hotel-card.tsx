import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import type { HotelSummary } from "../types";

export function HotelCard({ hotel }: { hotel: HotelSummary }) {
  return (
    <Card className="group overflow-hidden py-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {hotel.coverImageUrl ? (
          <Image
            src={hotel.coverImageUrl}
            alt={hotel.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        {hotel.starRating ? (
          <Badge className="absolute left-3 top-3 gap-1">
            {hotel.starRating} <Star className="size-3 fill-current" />
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {hotel.cityName}, {hotel.countryName}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{hotel.ratingAverage.toFixed(1)}</span>
            <span>({hotel.ratingCount})</span>
          </div>
          <p className="text-sm text-muted-foreground">
            from <span className="font-semibold text-foreground">{formatCurrency(hotel.basePrice, hotel.currencyCode)}</span>
            /night
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
