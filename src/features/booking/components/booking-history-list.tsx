import Link from "next/link";
import { CalendarDays, Hotel, MapPin, Plane } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/format";
import { BookingStatusBadge } from "./booking-status-badge";
import type { Booking } from "../types";

/** The other bookings made with the same email. One row shape for both types —
 * see the note on the API's BookingResponse. */
export function BookingHistoryList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => {
        const isPackage = booking.bookingType === "PACKAGE";
        const Icon = isPackage ? Plane : Hotel;
        const title = isPackage ? booking.packageTitle : booking.hotelName;
        const href = isPackage
          ? `/packages/${booking.packageSlug}`
          : `/hotels/${booking.hotelSlug}`;

        return (
          <Card key={booking.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={href} className="truncate font-medium text-foreground hover:underline">
                      {title}
                    </Link>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {booking.bookingNumber}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {booking.cityName}, {booking.countryName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="shrink-0 font-semibold text-foreground sm:text-right">
                {formatCurrency(booking.totalAmount, booking.currencyCode)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
