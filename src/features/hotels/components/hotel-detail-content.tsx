"use client";

import { MapPin, Phone, Star } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format";
import { MediaGallery } from "@/components/common/media-gallery";
import { useHotelDetail } from "../hooks/use-hotels";
import { HotelRoomsList } from "./hotel-rooms-list";
import { getAmenityIcon } from "../amenity-icons";
import type { HotelDetail } from "../types";

export function HotelDetailContent({ slug, initialHotel }: { slug: string; initialHotel: HotelDetail }) {
  const { data: hotel, isPending, isError } = useHotelDetail(slug, initialHotel);

  if (isPending) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Skeleton className="mb-4 h-8 w-2/3" />
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <p className="font-medium text-foreground">We couldn&apos;t load this hotel.</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again in a moment.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{hotel.name}</h1>
              {hotel.starRating ? (
                <Badge className="gap-1">
                  {hotel.starRating} <Star className="size-3 fill-current" />
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {hotel.addressLine1}, {hotel.cityName}, {hotel.countryName}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{hotel.ratingAverage.toFixed(1)}</span>
                <span>({hotel.ratingCount} reviews)</span>
              </span>
              {hotel.contactPhone ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-4" />
                  {hotel.contactPhone}
                </span>
              ) : null}
            </div>
          </div>

          <MediaGallery images={hotel.images} title={hotel.name} />

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-10">
              {hotel.description ? (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">About this hotel</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {hotel.description}
                  </p>
                </section>
              ) : null}

              {hotel.amenities.length > 0 ? (
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Amenities</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {hotel.amenities.map((amenity) => {
                      const Icon = getAmenityIcon(amenity.icon);
                      return (
                        <div key={amenity.id} className="flex items-center gap-2 text-sm text-foreground">
                          <Icon className="size-4 shrink-0 text-primary" />
                          {amenity.name}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section>
                <h2 className="mb-4 text-lg font-semibold text-foreground">Available Rooms</h2>
                <HotelRoomsList rooms={hotel.rooms} hotelSlug={hotel.slug} />
              </section>
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border bg-background p-5">
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(hotel.basePrice, hotel.currencyCode)}
                  <span className="text-sm font-normal text-muted-foreground"> /night</span>
                </p>
                <Separator className="my-4" />
                <dl className="flex flex-col gap-2 text-sm">
                  {hotel.checkInTime ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Check-in</dt>
                      <dd className="text-foreground">{hotel.checkInTime}</dd>
                    </div>
                  ) : null}
                  {hotel.checkOutTime ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Check-out</dt>
                      <dd className="text-foreground">{hotel.checkOutTime}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
