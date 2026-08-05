import { Suspense } from "react";
import type { Metadata } from "next";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchResultsContent } from "@/features/search/components/search-results-content";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/search");
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">
        {/* useSearchParams needs a Suspense boundary, otherwise the whole route
            opts out of static rendering. */}
        <Suspense>
          <SearchResultsContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
