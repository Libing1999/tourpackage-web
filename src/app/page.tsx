import type { Metadata } from "next";

import { HomePageContent } from "@/features/home/components/home-page-content";
import { fetchPageSeo } from "@/features/cms/api";
import { metadataForPath } from "@/features/cms/metadata";
import { env } from "@/utils/env";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/");
}

export default async function Home() {
  // The JSON-LD description is the same copy the CMS holds for this route, so
  // structured data and the meta description can't disagree.
  const seo = await fetchPageSeo("/");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "TourPackage",
    description: seo?.metaDescription ?? undefined,
    url: env.appUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageContent />
    </>
  );
}
