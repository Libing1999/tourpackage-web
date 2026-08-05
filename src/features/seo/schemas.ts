import type { PublicSettings } from "@/features/home/types";
import { absoluteUrl, SITE_NAME } from "./metadata";

/**
 * Builders for the JSON-LD documents the site emits.
 *
 * <p>Deliberately separate from the component that renders them: these are pure
 * functions of their inputs, which makes them directly unit-testable without a
 * React or DOM environment. Keeping them in the `.tsx` alongside the component
 * meant a test importing one had to parse JSX to reach it.
 */
type Json = Record<string, unknown>;

/** Drops keys whose value is null/undefined, so no `"image": null` reaches the output. */
function compact(obj: Json): Json {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));
}

/**
 * The company behind the site.
 *
 * <p>`sameAs` is what links the site to its social profiles in a knowledge
 * graph, so the settings rows the footer already renders are reused rather than
 * a second hardcoded list.
 */
export function organizationSchema(settings: PublicSettings): Json {
  const socials = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_twitter,
    settings.social_youtube,
  ].filter(Boolean);

  return compact({
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${absoluteUrl("/")}#organization`,
    name: settings.site_name || SITE_NAME,
    url: absoluteUrl("/"),
    description: settings.site_tagline || undefined,
    email: settings.contact_email || undefined,
    telephone: settings.contact_phone || undefined,
    address: settings.contact_address
      ? { "@type": "PostalAddress", streetAddress: settings.contact_address }
      : undefined,
    sameAs: socials.length > 0 ? socials : undefined,
  });
}

/**
 * The site itself, including how to search it.
 *
 * <p>`SearchAction` is what can surface a sitelinks search box in results, and
 * it points at the global search route — the target has to be a real URL
 * template that returns results for the substituted term.
 */
export function websiteSchema(settings: PublicSettings): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: settings.site_name || SITE_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface HotelSchemaInput {
  name: string;
  slug: string;
  description?: string | null;
  images: string[];
  cityName: string;
  countryName: string;
  address?: string | null;
  starRating?: number | null;
  basePrice?: number | null;
  currencyCode?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  amenities?: string[];
}

export function hotelSchema(hotel: HotelSchemaInput): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    url: absoluteUrl(`/hotels/${hotel.slug}`),
    description: hotel.description || undefined,
    image: hotel.images.length > 0 ? hotel.images.map(absoluteUrl) : undefined,
    address: compact({
      "@type": "PostalAddress",
      streetAddress: hotel.address || undefined,
      addressLocality: hotel.cityName,
      addressCountry: hotel.countryName,
    }),
    // starRating is the hotel's class; aggregateRating is what guests scored it.
    // They are different properties and conflating them is a common mistake.
    starRating: hotel.starRating
      ? { "@type": "Rating", ratingValue: hotel.starRating, bestRating: 5 }
      : undefined,
    aggregateRating:
      hotel.averageRating && hotel.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: hotel.averageRating,
            reviewCount: hotel.reviewCount,
            bestRating: 5,
          }
        : undefined,
    amenityFeature: hotel.amenities?.length
      ? hotel.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name }))
      : undefined,
    priceRange: hotel.basePrice ? `${hotel.currencyCode ?? "USD"} ${hotel.basePrice}+` : undefined,
  });
}

interface TripSchemaInput {
  title: string;
  slug: string;
  description?: string | null;
  images: string[];
  cityName: string;
  countryName: string;
  price?: number | null;
  discountedPrice?: number | null;
  currencyCode?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  itinerary?: { title: string; description?: string | null }[];
}

/**
 * A tour package.
 *
 * <p>`TouristTrip` describes the product accurately, but on its own it has no
 * price. The offer is attached so the listing can be eligible for price and
 * availability treatment in results, using the discounted price where one
 * exists — that is what a buyer would actually pay.
 */
export function tourPackageSchema(pkg: TripSchemaInput): Json {
  const price = pkg.discountedPrice ?? pkg.price;

  return compact({
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    url: absoluteUrl(`/packages/${pkg.slug}`),
    description: pkg.description || undefined,
    image: pkg.images.length > 0 ? pkg.images.map(absoluteUrl) : undefined,
    touristType: "Leisure",
    itinerary: pkg.itinerary?.length
      ? {
          "@type": "ItemList",
          numberOfItems: pkg.itinerary.length,
          itemListElement: pkg.itinerary.map((day, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: compact({
              "@type": "TouristAttraction",
              name: day.title,
              description: day.description || undefined,
            }),
          })),
        }
      : undefined,
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: pkg.currencyCode ?? "USD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/packages/${pkg.slug}`),
        }
      : undefined,
    aggregateRating:
      pkg.averageRating && pkg.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: pkg.averageRating,
            reviewCount: pkg.reviewCount,
            bestRating: 5,
          }
        : undefined,
  });
}

interface BlogPostingInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
}

export function blogPostingSchema(post: BlogPostingInput, settings: PublicSettings): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    description: post.excerpt || undefined,
    image: post.coverImageUrl ? absoluteUrl(post.coverImageUrl) : undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: { "@type": "Person", name: post.authorName || settings.site_name || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: settings.site_name || SITE_NAME,
      url: absoluteUrl("/"),
    },
  });
}

/**
 * The trail above the current page.
 *
 * <p>Search results render this as a path instead of a bare URL, which is the
 * whole reason to emit it. Positions are 1-based.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
