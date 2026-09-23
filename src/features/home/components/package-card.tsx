import Image from "next/image";
import { Clock, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDiscountPercent } from "@/utils/format";
import type { TourPackageSummary } from "../types";

export function PackageCard({ pkg }: { pkg: TourPackageSummary }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    // The photo sits inset in the card, framed by a few pixels of card, rather
    // than bleeding to its edges.
    <Card className="group h-full gap-0 rounded-2xl p-1.5 shadow-card ring-foreground/[0.07] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        {pkg.coverImageUrl ? (
          <Image
            src={pkg.coverImageUrl}
            alt={pkg.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
          />
        ) : null}
        {hasDiscount ? (
          <Badge className="absolute top-2.5 left-2.5 bg-destructive font-semibold text-white shadow-sm">
            {formatDiscountPercent(pkg.price, pkg.discountPrice!)}% OFF
          </Badge>
        ) : null}
        <Badge variant="secondary" className="absolute top-2.5 right-2.5 gap-1 bg-background/95 font-medium text-foreground shadow-sm">
          <Clock className="size-3" aria-hidden="true" />
          {pkg.durationDays}D/{pkg.durationNights}N
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 px-3 pt-3.5 pb-2.5">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" aria-hidden="true" />
          {pkg.cityName}, {pkg.countryName}
        </p>
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
          {pkg.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-foreground">{pkg.ratingAverage.toFixed(1)}</span>
            <span>({pkg.ratingCount})</span>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <p className="text-xs text-muted-foreground line-through">{formatCurrency(pkg.price, pkg.currencyCode)}</p>
            ) : null}
            <p className="text-lg leading-tight font-bold tracking-tight text-primary">
              {formatCurrency(hasDiscount ? pkg.discountPrice! : pkg.price, pkg.currencyCode)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
