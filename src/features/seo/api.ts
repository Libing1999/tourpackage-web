import { env } from "@/utils/env";
import type { ApiResponse } from "@/types/api";
import type { PublicSettings } from "@/features/home/types";

export interface SitemapEntry {
  slug: string;
  updatedAt: string;
}

export interface SitemapData {
  hotels: SitemapEntry[];
  packages: SitemapEntry[];
  blogPosts: SitemapEntry[];
}

/**
 * Server-side fetches, for the same reason as the CMS ones: metadata and
 * structured data have to be in the initial HTML or crawlers never see them,
 * and the axios client is browser-only.
 */

/** Slugs and last-modified dates for `sitemap.xml`. */
export async function fetchSitemapData(): Promise<SitemapData> {
  try {
    const res = await fetch(`${env.apiUrl}/public/seo/sitemap`, {
      // An hour: search engines re-crawl a sitemap far less often than this,
      // and a new hotel appearing in it 60 minutes late costs nothing.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return EMPTY_SITEMAP;
    const body: ApiResponse<SitemapData> = await res.json();
    return body.data ?? EMPTY_SITEMAP;
  } catch {
    // A sitemap missing its dynamic URLs is far better than a 500 on
    // /sitemap.xml, which tells a crawler the whole file is broken.
    return EMPTY_SITEMAP;
  }
}

/** Site identity — name, contacts, social profiles — for Organization JSON-LD. */
export async function fetchSeoSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch(`${env.apiUrl}/public/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const body: ApiResponse<PublicSettings> = await res.json();
    return body.data ?? {};
  } catch {
    return {};
  }
}

/** Published FAQs, for FAQPage structured data on the homepage. */
export async function fetchSeoFaqs(): Promise<{ question: string; answer: string }[]> {
  try {
    const res = await fetch(`${env.apiUrl}/public/faqs`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body: ApiResponse<{ question: string; answer: string }[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

const EMPTY_SITEMAP: SitemapData = { hotels: [], packages: [], blogPosts: [] };
