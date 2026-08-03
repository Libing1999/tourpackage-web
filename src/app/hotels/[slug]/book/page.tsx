import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BookingFlow } from "@/features/booking/components/booking-flow";
import { Spinner } from "@/components/common/spinner";
import type { ApiResponse } from "@/types/api";
import type { HotelDetail } from "@/features/hotels/types";
import { env } from "@/utils/env";

interface BookPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ roomId?: string }>;
}

export const metadata: Metadata = {
  title: "Complete your booking",
  // A half-finished booking form has nothing to offer a search engine, and
  // indexing it would compete with the hotel page it came from.
  robots: { index: false, follow: false },
};

async function fetchHotel(slug: string): Promise<HotelDetail | null> {
  try {
    // No caching here: the room list drives availability and price, and a
    // stale one would let a guest start a booking against a room that's since
    // been deactivated or repriced.
    const res = await fetch(`${env.apiUrl}/public/hotels/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    const body: ApiResponse<HotelDetail> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export default async function BookHotelPage({ params, searchParams }: BookPageProps) {
  const { slug } = await params;
  const { roomId } = await searchParams;
  const hotel = await fetchHotel(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <BookingFlow hotel={hotel} initialRoomId={roomId} />
    </Suspense>
  );
}
