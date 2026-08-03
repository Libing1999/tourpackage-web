import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    return { title: "Hotel Not Found" };
  }

  const title = hotel.metaTitle || `${hotel.name} — ${hotel.cityName}, ${hotel.countryName}`;
  const description =
    hotel.metaDescription || hotel.shortDescription || hotel.description?.slice(0, 160) || undefined;
  const url = `${env.appUrl}/hotels/${hotel.slug}`;
  const coverImage = hotel.images.find((img) => img.isCover)?.url ?? hotel.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TourPackage",
      type: "website",
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HotelDetailPage({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = await fetchHotel(slug);

  if (!hotel) {
    notFound();
  }

  return <HotelDetailContent slug={slug} initialHotel={hotel} />;
}
