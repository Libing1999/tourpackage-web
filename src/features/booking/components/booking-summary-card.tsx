import { CalendarDays, MapPin, Users } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import type { HotelDetail, HotelRoom } from "@/features/hotels/types";

interface BookingSummaryCardProps {
  hotel: Pick<HotelDetail, "name" | "cityName" | "countryName">;
  room: Pick<HotelRoom, "name" | "roomTypeName" | "pricePerNight" | "currencyCode">;
  checkInDate?: string;
  checkOutDate?: string;
  nights: number;
  numberOfAdults: number;
  numberOfChildren: number;
}

export function BookingSummaryCard({
  hotel,
  room,
  checkInDate,
  checkOutDate,
  nights,
  numberOfAdults,
  numberOfChildren,
}: BookingSummaryCardProps) {
  const total = room.pricePerNight * nights;

  return (
    <div className="rounded-2xl border bg-background p-5">
      <h2 className="font-semibold text-foreground">{hotel.name}</h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {hotel.cityName}, {hotel.countryName}
      </p>

      <Separator className="my-4" />

      <p className="text-sm font-medium text-foreground">{room.name}</p>
      {room.roomTypeName ? (
        <p className="text-xs text-muted-foreground">{room.roomTypeName}</p>
      ) : null}

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        {checkInDate && checkOutDate ? (
          <div className="flex justify-between gap-4">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> Dates
            </dt>
            <dd className="text-right text-foreground">
              {formatDate(checkInDate)} – {formatDate(checkOutDate)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" /> Guests
          </dt>
          <dd className="text-right text-foreground">
            {numberOfAdults} adult{numberOfAdults !== 1 ? "s" : ""}
            {numberOfChildren > 0 ? `, ${numberOfChildren} child${numberOfChildren !== 1 ? "ren" : ""}` : ""}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            {formatCurrency(room.pricePerNight, room.currencyCode)} × {nights} night
            {nights !== 1 ? "s" : ""}
          </dt>
          <dd className="text-foreground">{formatCurrency(total, room.currencyCode)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="text-foreground">{formatCurrency(total, room.currencyCode)}</dd>
        </div>
      </dl>
    </div>
  );
}
