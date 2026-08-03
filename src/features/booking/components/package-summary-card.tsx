import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import type { TourPackageDetail } from "@/features/packages/types";
import { addDaysIso } from "../date-utils";

interface PackageSummaryCardProps {
  pkg: TourPackageDetail;
  travelDate?: string;
  numberOfAdults: number;
  numberOfChildren: number;
}

export function PackageSummaryCard({
  pkg,
  travelDate,
  numberOfAdults,
  numberOfChildren,
}: PackageSummaryCardProps) {
  // Per-person rates come from the API rather than being re-derived here, so
  // the quoted total and the charged total can't drift apart.
  const adultsTotal = pkg.pricePerAdult * numberOfAdults;
  const childrenTotal = pkg.pricePerChild * numberOfChildren;
  const total = adultsTotal + childrenTotal;

  // The package's own duration fixes the return date, matching how the server
  // derives it.
  const returnDate = travelDate ? addDaysIso(travelDate, pkg.durationDays - 1) : undefined;

  return (
    <div className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold text-foreground">{pkg.title}</h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {pkg.cityName}, {pkg.countryName}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        {pkg.durationDays} days / {pkg.durationNights} nights
      </p>

      <Separator className="my-4" />

      {travelDate ? (
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> Departs
            </dt>
            <dd className="text-right text-foreground">{formatDate(travelDate)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> Returns
            </dt>
            <dd className="text-right text-foreground">{returnDate ? formatDate(returnDate) : "—"}</dd>
          </div>
        </dl>
      ) : null}

      <Separator className="my-4" />

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {formatCurrency(pkg.pricePerAdult, pkg.currencyCode)} × {numberOfAdults} adult
            {numberOfAdults !== 1 ? "s" : ""}
          </dt>
          <dd className="text-foreground">{formatCurrency(adultsTotal, pkg.currencyCode)}</dd>
        </div>
        {numberOfChildren > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {formatCurrency(pkg.pricePerChild, pkg.currencyCode)} × {numberOfChildren} child
              {numberOfChildren !== 1 ? "ren" : ""}
            </dt>
            <dd className="text-foreground">{formatCurrency(childrenTotal, pkg.currencyCode)}</dd>
          </div>
        ) : null}
        <div className="mt-1 flex justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="text-foreground">{formatCurrency(total, pkg.currencyCode)}</dd>
        </div>
      </dl>
    </div>
  );
}
