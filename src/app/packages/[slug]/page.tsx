import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    return { title: "Package Not Found" };
  }

  const title = pkg.metaTitle || `${pkg.title} — ${pkg.durationDays} Days in ${pkg.cityName}`;
  const description =
    pkg.metaDescription || pkg.summary || pkg.description?.slice(0, 160) || undefined;
  const url = `${env.appUrl}/packages/${pkg.slug}`;
  const coverImage = pkg.images.find((img) => img.isCover)?.url ?? pkg.images[0]?.url;

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

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = await fetchPackage(slug);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailContent slug={slug} initialPackage={pkg} />;
}
