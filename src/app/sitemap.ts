import type { MetadataRoute } from "next";

import { env } from "@/utils/env";
import { fetchSitemapData } from "@/features/seo/api";

/** Rebuilt at most hourly; the underlying fetch is cached for the same period. */
export const revalidate = 3600;

/**
 * Static routes, with the priorities and change rates that actually describe them.
 *
 * <p>Routes deliberately absent: `/search` (infinite query-string variants, no
 * content of its own), `/bookings` and `/bookings/confirmation` (personal, and
 * meaningless without a reference), and everything under `/dashboard`,
 * `/login` and `/profile`. See `robots.ts`, which disallows the same set.
 */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/hotels", priority: 0.9, changeFrequency: "daily" },
  { path: "/packages", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { hotels, packages, blogPosts } = await fetchSitemapData();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${env.appUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Detail pages carry a real lastModified from the database, which is the one
  // field in a sitemap a crawler genuinely acts on — it decides what to re-fetch.
  const entityEntries: MetadataRoute.Sitemap = [
    ...hotels.map((entry) => ({
      url: `${env.appUrl}/hotels/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...packages.map((entry) => ({
      url: `${env.appUrl}/packages/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((entry) => ({
      url: `${env.appUrl}/blog/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticEntries, ...entityEntries];
}
