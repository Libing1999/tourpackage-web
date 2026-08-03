import Image from "next/image";
import { Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDiscountPercent } from "@/utils/format";
import type { TourPackageSummary } from "../types";

export function PackageCard({ pkg }: { pkg: TourPackageSummary }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    <Card className="group overflow-hidden py-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {pkg.coverImageUrl ? (
          <Image
            src={pkg.coverImageUrl}
            alt={pkg.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        {hasDiscount ? (
          <Badge variant="destructive" className="absolute left-3 top-3">
            {formatDiscountPercent(pkg.price, pkg.discountPrice!)}% OFF
          </Badge>
        ) : null}
        <Badge variant="secondary" className="absolute right-3 top-3 gap-1">
          <Clock className="size-3" />
          {pkg.durationDays}D/{pkg.durationNights}N
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">{pkg.title}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {pkg.cityName}, {pkg.countryName}
        </p>
        <div className="mt-1 flex items-end justify-between">
          <div className="text-xs text-muted-foreground">
            ★ {pkg.ratingAverage.toFixed(1)} ({pkg.ratingCount})
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <p className="text-xs text-muted-foreground line-through">{formatCurrency(pkg.price)}</p>
            ) : null}
            <p className="font-semibold text-foreground">
              {formatCurrency(hasDiscount ? pkg.discountPrice! : pkg.price)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
