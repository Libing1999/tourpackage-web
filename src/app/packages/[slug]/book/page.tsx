import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PackageBookingFlow } from "@/features/booking/components/package-booking-flow";
import { Spinner } from "@/components/common/spinner";
import type { ApiResponse } from "@/types/api";
import type { TourPackageDetail } from "@/features/packages/types";
import { env } from "@/utils/env";

interface BookPackagePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Book this package",
  robots: { index: false, follow: false },
};

async function fetchPackage(slug: string): Promise<TourPackageDetail | null> {
  try {
    // No caching: price and group-size limits drive what the guest is quoted
    // and allowed to book, and a stale copy would let them start against
    // numbers the server will reject.
    const res = await fetch(`${env.apiUrl}/public/tour-packages/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    const body: ApiResponse<TourPackageDetail> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export default async function BookPackagePage({ params }: BookPackagePageProps) {
  const { slug } = await params;
  const pkg = await fetchPackage(slug);

  if (!pkg) {
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
      <PackageBookingFlow pkg={pkg} />
    </Suspense>
  );
}
