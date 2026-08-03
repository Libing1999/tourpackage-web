import type { Metadata } from "next";

import { env } from "@/utils/env";
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

  const url = `${env.appUrl}${path}`;
  const description = seo.metaDescription ?? undefined;

  return {
    // `absolute` so a CMS-authored title is used exactly as written, instead of
    // picking up the layout's "%s — TourPackage" suffix on top of a title that
    // usually already names the brand.
    title: { absolute: seo.metaTitle },
    description,
    alternates: { canonical: url },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.metaTitle,
      description,
      url,
      siteName: "TourPackage",
      type: "website",
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description,
    },
  };
}
