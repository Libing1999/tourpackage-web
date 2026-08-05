import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, notFoundMetadata } from "@/features/seo/metadata";
import { JsonLd, breadcrumbSchema, hotelSchema } from "@/features/seo/structured-data";

import { HotelDetailContent } from "@/features/hotels/components/hotel-detail-content";
import type { ApiResponse } from "@/types/api";
import type { HotelDetail } from "@/features/hotels/types";
import { env } from "@/utils/env";

interface HotelPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchHotel(slug: string): Promise<HotelDetail | null> {
  try {
    const res = await fetch(`${env.apiUrl}/public/hotels/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return null;
    }
    const body: ApiResponse<HotelDetail> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: HotelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await fetchHotel(slug);

  if (!hotel) {
    return notFoundMetadata("Hotel");
  }

  return buildMetadata({
    title: hotel.metaTitle || `${hotel.name} — ${hotel.cityName}, ${hotel.countryName}`,
    description: hotel.metaDescription || hotel.shortDescription || hotel.description,
    path: `/hotels/${hotel.slug}`,
    imageUrl: coverImage(hotel.images),
  });
}

function coverImage(images: { url: string; isCover: boolean }[]): string | undefined {
  return images.find((img) => img.isCover)?.url ?? images[0]?.url;
}

export default async function HotelDetailPage({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = await fetchHotel(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          hotelSchema({
            name: hotel.name,
            slug: hotel.slug,
            description: hotel.shortDescription || hotel.description,
            images: hotel.images.map((img) => img.url),
            cityName: hotel.cityName,
            countryName: hotel.countryName,
            address: [hotel.addressLine1, hotel.addressLine2].filter(Boolean).join(", "),
            starRating: hotel.starRating,
            basePrice: hotel.basePrice,
            currencyCode: hotel.currencyCode,
            // ratingCount of 0 means nobody has rated it; emitting an
            // aggregateRating of 0 from 0 reviews is invalid structured data.
            averageRating: hotel.ratingCount > 0 ? hotel.ratingAverage : null,
            reviewCount: hotel.ratingCount || null,
            amenities: hotel.amenities.map((a) => a.name),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Hotels", path: "/hotels" },
            { name: hotel.name, path: `/hotels/${hotel.slug}` },
          ]),
        ]}
      />
      <HotelDetailContent slug={slug} initialHotel={hotel} />
    </>
  );
}
