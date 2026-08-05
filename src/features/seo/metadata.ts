import type { Metadata } from "next";

import { env } from "@/utils/env";

export const SITE_NAME = "TourPackage";

/** Truncated to roughly what Google renders before it starts eliding. */
const MAX_DESCRIPTION = 160;

interface BuildMetadataInput {
  title: string;
  description?: string | null;
  /** Route path beginning with a slash; becomes the canonical and og:url. */
  path: string;
  imageUrl?: string | null;
  /** `article` for blog posts, `website` for everything else. */
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
  /** Use the title exactly as given, without the layout's "— TourPackage" suffix. */
  absoluteTitle?: boolean;
}

/**
 * The single place page metadata is assembled.
 *
 * <p>Four routes previously built this object by hand — the CMS-driven static
 * pages plus the three detail pages — and all four had drifted into slightly
 * different shapes, with every one of them declaring a
 * `summary_large_image` Twitter card and then supplying no image for it.
 * Centralising means a fix to the tags applies everywhere at once.
 */
export function buildMetadata({
  title,
  description,
  path,
  imageUrl,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
  absoluteTitle,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const cleanDescription = truncate(description);
  // Both OpenGraph and Twitter need absolute URLs — a crawler resolves them
  // from its own host, not from the page it found them on.
  const images = imageUrl ? [absoluteUrl(imageUrl)] : undefined;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: cleanDescription,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: cleanDescription,
      url,
      siteName: SITE_NAME,
      type,
      images,
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      // The large card is the reason images matter here: declared without one,
      // Twitter silently downgrades to a small summary card.
      card: images ? "summary_large_image" : "summary",
      title,
      description: cleanDescription,
      images,
    },
  };
}

/** Metadata for a page that does not exist, so a 404 is never indexed. */
export function notFoundMetadata(what: string): Metadata {
  return {
    title: `${what} not found`,
    robots: { index: false, follow: false },
  };
}

/** Absolute form of a path, passing through anything already absolute. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  return `${env.appUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Trims a description to a sensible length on a word boundary.
 *
 * <p>Descriptions here come from CMS fields and from the first 160 characters of
 * a body, and the latter routinely lands mid-word. Cutting back to the last
 * space and appending an ellipsis reads as deliberate rather than truncated.
 */
function truncate(text: string | null | undefined): string | undefined {
  if (!text) return undefined;

  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= MAX_DESCRIPTION) return collapsed;

  const cut = collapsed.slice(0, MAX_DESCRIPTION);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, "")}…`;
}
