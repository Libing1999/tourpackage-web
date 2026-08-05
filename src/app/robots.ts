import type { MetadataRoute } from "next";

import { env } from "@/utils/env";

/**
 * Kept in step with `sitemap.ts`: anything disallowed here is also absent there,
 * because listing a URL in a sitemap and then blocking it is a contradiction
 * crawlers report as an error.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Only what a crawler should never fetch at all.
          //
          // Everything else that must stay out of the index — the admin pages,
          // /profile, the auth pages, the booking flow — carries a `noindex`
          // instead, and is deliberately NOT listed here: a Disallow would stop
          // the crawler fetching the page, and a noindex it never fetches is a
          // noindex it never reads. Blocking and noindexing the same URL is a
          // contradiction that leaves it indexed with no description.
          "/dashboard",
          // Unbounded query-string space with no content of its own — exactly
          // what crawl budget gets wasted on.
          "/search",
          // Nothing under here is a page; assets are served from the API host.
          "/api/",
        ],
      },
    ],
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
