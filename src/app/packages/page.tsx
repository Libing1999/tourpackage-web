import type { Metadata } from "next";
import { Suspense } from "react";

import { PackagesListingContent } from "@/features/packages/components/packages-listing-content";
import { CardGridSkeleton } from "@/features/home/components/card-grid-skeleton";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/packages");
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <CardGridSkeleton
          count={9}
          cardClassName="aspect-auto h-72"
          className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:px-8 xl:grid-cols-3"
        />
      }
    >
      <PackagesListingContent />
    </Suspense>
  );
}
