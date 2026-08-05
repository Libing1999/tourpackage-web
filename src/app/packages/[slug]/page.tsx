import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata, notFoundMetadata } from "@/features/seo/metadata";
import { JsonLd, breadcrumbSchema, tourPackageSchema } from "@/features/seo/structured-data";

import { PackageDetailContent } from "@/features/packages/components/package-detail-content";
import type { ApiResponse } from "@/types/api";
import type { TourPackageDetail } from "@/features/packages/types";
import { env } from "@/utils/env";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

async function fetchPackage(slug: string): Promise<TourPackageDetail | null> {
  try {
    const res = await fetch(`${env.apiUrl}/public/tour-packages/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return null;
    }
    const body: ApiResponse<TourPackageDetail> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await fetchPackage(slug);

  if (!pkg) {
    return notFoundMetadata("Package");
  }

  return buildMetadata({
    title: pkg.metaTitle || `${pkg.title} — ${pkg.durationDays} Days in ${pkg.cityName}`,
    description: pkg.metaDescription || pkg.summary || pkg.description,
    path: `/packages/${pkg.slug}`,
    imageUrl: pkg.images.find((img) => img.isCover)?.url ?? pkg.images[0]?.url,
  });
}

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = await fetchPackage(slug);

  if (!pkg) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          tourPackageSchema({
            title: pkg.title,
            slug: pkg.slug,
            description: pkg.summary || pkg.description,
            images: pkg.images.map((img) => img.url),
            cityName: pkg.cityName,
            countryName: pkg.countryName,
            price: pkg.price,
            discountedPrice: pkg.discountPrice,
            currencyCode: pkg.currencyCode,
            averageRating: pkg.ratingCount > 0 ? pkg.ratingAverage : null,
            reviewCount: pkg.ratingCount || null,
            itinerary: pkg.itinerary.map((day) => ({
              title: day.title,
              description: day.description,
            })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Packages", path: "/packages" },
            { name: pkg.title, path: `/packages/${pkg.slug}` },
          ]),
        ]}
      />
      <PackageDetailContent slug={slug} initialPackage={pkg} />
    </>
  );
}
