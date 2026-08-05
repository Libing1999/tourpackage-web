import { describe, expect, it } from "vitest";

import { absoluteUrl, buildMetadata, notFoundMetadata } from "./metadata";

/**
 * Next's `Twitter` metadata type is a union whose members differ by card type,
 * so `card` and `images` are not readable off the union directly. The builder
 * always produces the summary shape; narrowing here keeps the assertions honest
 * without loosening the production type.
 */
function twitter(meta: ReturnType<typeof buildMetadata>) {
  return meta.twitter as { card?: string; images?: unknown[] } | undefined;
}

describe("absoluteUrl", () => {
  it("makes a path absolute", () => {
    expect(absoluteUrl("/hotels")).toMatch(/^https?:\/\/.+\/hotels$/);
  });

  it("leaves an already-absolute URL alone", () => {
    // CMS and upload URLs arrive absolute; prefixing them would corrupt them.
    expect(absoluteUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("tolerates a path with no leading slash", () => {
    expect(absoluteUrl("hotels")).toMatch(/\/hotels$/);
  });
});

describe("buildMetadata", () => {
  const base = { title: "Hotels", path: "/hotels" };

  it("sets a canonical matching og:url", () => {
    const meta = buildMetadata(base);
    expect(meta.alternates?.canonical).toBe(meta.openGraph?.url);
  });

  it("uses a large card only when there is an image", () => {
    // Declaring summary_large_image without an image silently downgrades the
    // card — the bug that motivated centralising this.
    expect(twitter(buildMetadata(base))?.card).toBe("summary");
    expect(twitter(buildMetadata({ ...base, imageUrl: "/a.jpg" }))?.card).toBe("summary_large_image");
  });

  it("gives Twitter the same image as OpenGraph, absolute", () => {
    const meta = buildMetadata({ ...base, imageUrl: "/a.jpg" });
    expect(twitter(meta)?.images).toEqual(meta.openGraph?.images);
    expect(String(twitter(meta)?.images?.[0])).toMatch(/^https?:\/\//);
  });

  it("truncates a long description on a word boundary", () => {
    const meta = buildMetadata({ ...base, description: "word ".repeat(80) });
    const description = meta.description as string;

    expect(description.length).toBeLessThanOrEqual(161);
    expect(description.endsWith("…")).toBe(true);
    // Cutting at exactly 160 characters routinely lands mid-word.
    expect(description).not.toMatch(/\s\S{1,3}…$/);
  });

  it("leaves a short description untouched", () => {
    expect(buildMetadata({ ...base, description: "Short and sweet." }).description)
      .toBe("Short and sweet.");
  });

  it("collapses whitespace in a description taken from a body", () => {
    expect(buildMetadata({ ...base, description: "a\n\n  b\tc" }).description).toBe("a b c");
  });

  it("omits the description entirely when there is none", () => {
    expect(buildMetadata(base).description).toBeUndefined();
  });

  it("marks a page noindex when asked", () => {
    expect(buildMetadata({ ...base, noIndex: true }).robots).toEqual({ index: false, follow: false });
    expect(buildMetadata(base).robots).toBeUndefined();
  });

  it("carries article timestamps only for articles", () => {
    const article = buildMetadata({ ...base, type: "article", publishedTime: "2026-01-01T00:00:00Z" });
    expect(article.openGraph).toHaveProperty("publishedTime", "2026-01-01T00:00:00Z");

    expect(buildMetadata({ ...base, publishedTime: "2026-01-01T00:00:00Z" }).openGraph)
      .not.toHaveProperty("publishedTime");
  });

  it("uses an absolute title only when asked", () => {
    // CMS titles already name the brand, so the layout suffix would double it.
    expect(buildMetadata({ ...base, absoluteTitle: true }).title).toEqual({ absolute: "Hotels" });
    expect(buildMetadata(base).title).toBe("Hotels");
  });
});

describe("notFoundMetadata", () => {
  it("keeps a 404 out of the index", () => {
    expect(notFoundMetadata("Hotel").robots).toEqual({ index: false, follow: false });
  });
});
