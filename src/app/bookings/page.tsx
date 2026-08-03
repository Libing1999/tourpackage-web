import type { Metadata } from "next";

import { BookingLookupContent } from "@/features/booking/components/booking-lookup-content";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/bookings");
}

export default function BookingLookupPage() {
  return <BookingLookupContent />;
}
