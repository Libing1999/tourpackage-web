import Link from "next/link";
import { BedDouble, Maximize2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import type { HotelRoom } from "../types";

export function HotelRoomsList({ rooms, hotelSlug }: { rooms: HotelRoom[]; hotelSlug: string }) {
  if (rooms.length === 0) {
    return <p className="text-sm text-muted-foreground">Room details for this hotel aren&apos;t available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">{room.name}</h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {room.roomTypeName}
                </Badge>
                {!room.isAvailable ? <Badge variant="destructive">Sold out</Badge> : null}
              </div>

              {room.description ? (
                <p className="max-w-xl text-sm text-muted-foreground">{room.description}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {room.maxAdults} adult{room.maxAdults !== 1 ? "s" : ""}
                  {room.maxChildren > 0 ? `, ${room.maxChildren} child${room.maxChildren !== 1 ? "ren" : ""}` : ""}
                </span>
                {room.bedType ? (
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="size-3.5" />
                    {room.bedCount} {room.bedType} bed{room.bedCount !== 1 ? "s" : ""}
                  </span>
                ) : null}
                {room.sizeSqm ? (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="size-3.5" />
                    {room.sizeSqm} m²
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(room.pricePerNight, room.currencyCode)}
                <span className="text-sm font-normal text-muted-foreground"> /night</span>
              </p>
              {room.isAvailable ? (
                <Link
                  href={`/hotels/${hotelSlug}/book?roomId=${room.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Select Room
                </Link>
              ) : (
                <Button size="sm" disabled>
                  Unavailable
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
