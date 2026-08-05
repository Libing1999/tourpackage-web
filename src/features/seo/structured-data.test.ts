import { describe, expect, it } from "vitest";

import {
  blogPostingSchema,
  breadcrumbSchema,
  faqSchema,
  hotelSchema,
  organizationSchema,
  tourPackageSchema,
  websiteSchema,
} from "./schemas";

const settings = {
  site_name: "TourPackage",
  site_tagline: "Your journey, perfectly planned.",
  contact_email: "hello@example.com",
  social_twitter: "https://twitter.com/x",
};

describe("organizationSchema", () => {
  it("links social profiles through sameAs", () => {
    expect(organizationSchema(settings).sameAs).toEqual(["https://twitter.com/x"]);
  });

  it("omits sameAs entirely when there are no profiles", () => {
    // An empty array is a claim of "no profiles"; absence is the honest form.
    expect(organizationSchema({}).sameAs).toBeUndefined();
  });

  it("omits keys with no value rather than emitting nulls", () => {
    const schema = organizationSchema({});
    expect(Object.values(schema)).not.toContain(null);
    expect(schema).not.toHaveProperty("email");
  });
});

describe("websiteSchema", () => {
  it("declares a search action pointing at a real query template", () => {
    const action = websiteSchema(settings).potentialAction as Record<string, unknown>;
    const target = action.target as Record<string, string>;

    expect(target.urlTemplate).toContain("/search?q={search_term_string}");
    expect(action["query-input"]).toBe("required name=search_term_string");
  });
});

describe("hotelSchema", () => {
  const base = {
    name: "Bali Serenity Villas",
    slug: "bali-serenity-villas",
    images: ["/a.jpg"],
    cityName: "Bali",
    countryName: "Indonesia",
  };

  it("keeps starRating and aggregateRating distinct", () => {
    const schema = hotelSchema({ ...base, starRating: 4, averageRating: 4.6, reviewCount: 553 });

    // Hotel class and guest scores are different properties; conflating them is
    // a common structured-data mistake.
    expect((schema.starRating as Record<string, number>).ratingValue).toBe(4);
    expect((schema.aggregateRating as Record<string, number>).ratingValue).toBe(4.6);
  });

  it("omits aggregateRating when nothing has been rated", () => {
    // "rated 0 by 0 people" is invalid, not a neutral default.
    expect(hotelSchema({ ...base, averageRating: null, reviewCount: null }).aggregateRating)
      .toBeUndefined();
  });

  it("makes image URLs absolute", () => {
    expect((hotelSchema(base).image as string[])[0]).toMatch(/^https?:\/\//);
  });
});

describe("tourPackageSchema", () => {
  const base = {
    title: "Bali Tropical Retreat",
    slug: "bali-tropical-retreat",
    images: [],
    cityName: "Bali",
    countryName: "Indonesia",
    currencyCode: "USD",
  };

  it("offers the discounted price, which is what a buyer pays", () => {
    const offer = tourPackageSchema({ ...base, price: 1499, discountedPrice: 1099 }).offers as Record<string, unknown>;
    expect(offer.price).toBe(1099);
  });

  it("falls back to list price when there is no discount", () => {
    const offer = tourPackageSchema({ ...base, price: 1499, discountedPrice: null }).offers as Record<string, unknown>;
    expect(offer.price).toBe(1499);
  });

  it("omits the offer when there is no price at all", () => {
    expect(tourPackageSchema({ ...base, price: null, discountedPrice: null }).offers).toBeUndefined();
  });

  it("numbers itinerary days from one", () => {
    const itinerary = tourPackageSchema({
      ...base,
      price: 100,
      itinerary: [{ title: "Arrive" }, { title: "Explore" }],
    }).itinerary as Record<string, unknown>;

    expect(itinerary.numberOfItems).toBe(2);
    expect((itinerary.itemListElement as Record<string, number>[])[0].position).toBe(1);
  });
});

describe("breadcrumbSchema", () => {
  it("numbers positions from one and absolutises each item", () => {
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Hotels", path: "/hotels" },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];

    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(String(items[1].item)).toMatch(/^https?:\/\/.+\/hotels$/);
  });
});

describe("blogPostingSchema", () => {
  it("falls back to publishedAt when the post was never modified", () => {
    const schema = blogPostingSchema(
      { title: "T", slug: "t", publishedAt: "2026-01-01T00:00:00Z" },
      settings
    );
    expect(schema.dateModified).toBe("2026-01-01T00:00:00Z");
  });

  it("attributes the post to the site when it has no named author", () => {
    const author = blogPostingSchema({ title: "T", slug: "t" }, settings).author as Record<string, string>;
    expect(author.name).toBe("TourPackage");
  });
});

describe("faqSchema", () => {
  it("wraps each answer in an acceptedAnswer", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }]);
    const entity = (schema.mainEntity as Record<string, unknown>[])[0];

    expect(entity.name).toBe("Q?");
    expect((entity.acceptedAnswer as Record<string, string>).text).toBe("A.");
  });
});
