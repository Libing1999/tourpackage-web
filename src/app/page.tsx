import type { Metadata } from "next";

import { HomePageContent } from "@/features/home/components/home-page-content";
import { metadataForPath } from "@/features/cms/metadata";
import { fetchSeoFaqs } from "@/features/seo/api";
import { JsonLd, faqSchema } from "@/features/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/");
}

export default async function Home() {
  const faqs = await fetchSeoFaqs();

  // Organization and WebSite are emitted once in the root layout, so this page
  // adds only what is specific to it. An earlier version declared its own
  // TravelAgency node here, which became a second, thinner copy of the same
  // entity the moment the layout gained one.
  return (
    <>
      {faqs.length > 0 ? <JsonLd data={faqSchema(faqs)} /> : null}
      <HomePageContent />
    </>
  );
}
