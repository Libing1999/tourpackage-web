import type { Metadata } from "next";

import { buildMetadata } from "@/features/seo/metadata";
import { fetchPageSeo } from "./api";

/**
 * Builds Next.js `Metadata` for a route from the CMS's `page_seo` row.
 *
 * <p>Called from `generateMetadata`, which runs on the server, so the title and
 * description are in the initial HTML where crawlers can see them — the whole
 * point of managing SEO rather than rendering it client-side.
 *
 * <p>Returns an empty object when the CMS has no row for the path or is
 * unreachable: the page then falls back to the root layout's title template
 * rather than to a hardcoded per-page string.
 */
export async function metadataForPath(path: string): Promise<Metadata> {
  const seo = await fetchPageSeo(path);

  if (!seo) {
    return {};
  }

  return buildMetadata({
    title: seo.metaTitle,
    description: seo.metaDescription,
    path,
    imageUrl: seo.ogImageUrl,
    noIndex: seo.noIndex,
    // A CMS-authored title is used exactly as written, rather than picking up
    // the layout's "%s — TourPackage" suffix on top of one that usually already
    // names the brand.
    absoluteTitle: true,
  });
}
