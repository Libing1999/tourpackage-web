import Image from "next/image";
import { Clock, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDiscountPercent } from "@/utils/format";
import type { TourPackageSummary } from "../types";

export function PackageCard({ pkg }: { pkg: TourPackageSummary }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0 shadow-card ring-foreground/[0.06] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {pkg.coverImageUrl ? (
          <Image
            src={pkg.coverImageUrl}
            alt={pkg.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        {hasDiscount ? (
          <Badge className="absolute left-3 top-3 bg-destructive font-semibold text-white shadow-sm">
            {formatDiscountPercent(pkg.price, pkg.discountPrice!)}% OFF
          </Badge>
        ) : null}
        <Badge variant="secondary" className="absolute right-3 top-3 gap-1 bg-background/90 shadow-sm backdrop-blur">
          <Clock className="size-3" />
          {pkg.durationDays}D/{pkg.durationNights}N
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <h3 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">{pkg.title}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {pkg.cityName}, {pkg.countryName}
        </p>
        <div className="mt-auto flex items-end justify-between border-t border-dashed pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{pkg.ratingAverage.toFixed(1)}</span>
            <span>({pkg.ratingCount})</span>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <p className="text-xs text-muted-foreground line-through">{formatCurrency(pkg.price, pkg.currencyCode)}</p>
            ) : null}
            <p className="text-lg font-bold text-primary">
              {formatCurrency(hasDiscount ? pkg.discountPrice! : pkg.price, pkg.currencyCode)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
