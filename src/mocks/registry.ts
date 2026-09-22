/**
 * Maps an HTTP method + path to local mock data, standing in for the real
 * API. Shared by services/mock-adapter.ts (axios) and services/server-fetch.ts
 * (the plain `fetch` calls server components make) so both transports serve
 * data from the exact same source — see config/feature-flags.ts.
 */
import type { Booking, BookingTraveller } from "@/features/booking/types";
import type { CreateHotelBookingPayload, CreatePackageBookingPayload } from "@/features/booking/api";
import type { PaginatedResponse } from "@/types/api";
import type { HotelSummary, TourPackageSummary } from "@/features/home/types";
import type { SearchHit, SearchSuggestions } from "@/features/search/types";
import {
  findMockBlogDetail,
  findMockHotelDetail,
  findMockPackageDetail,
  mockAmenities,
  mockBanners,
  mockBestPackages,
  mockBlogPosts,
  mockDestinations,
  mockFaqs,
  mockGallery,
  mockHotels,
  mockPackages,
  mockPopularSearches,
  mockPublicSettings,
  mockSitemapData,
  mockSiteContent,
  mockSpecialOffers,
  mockTestimonials,
  searchMockHits,
} from "./fixtures";

export interface MockResult {
  status: number;
  data: unknown;
}

type Params = Record<string, unknown>;

interface RouteContext {
  match: RegExpMatchArray;
  params: Params;
  body: unknown;
}

interface Route {
  method: string;
  pattern: RegExp;
  handler: (ctx: RouteContext) => unknown;
}

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function paginate<T>(items: T[], params: Params): PaginatedResponse<T> {
  const page = num(params.page, 0);
  const size = num(params.size, 12);
  const start = page * size;
  const content = items.slice(start, start + size);
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  return { content, page, size, totalElements, totalPages, last: page >= totalPages - 1 };
}

function filterBySearch<T>(items: T[], search: unknown, pick: (item: T) => string): T[] {
  const q = str(search).trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => pick(item).toLowerCase().includes(q));
}

// A session-scoped "database" for bookings created through the mock create
// endpoints, so the confirmation page's lookup (a separate request) can find
// what the create call just synthesised. Lives only in the browser tab's
// memory — there is no backend to persist it to.
const bookingStore = new Map<string, Booking>();

function generateBookingNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
}

function synthesiseTravellers(input: CreateHotelBookingPayload["travellers"] | undefined): BookingTraveller[] {
  if (!Array.isArray(input)) return [];
  return input.map((t, i) => ({
    id: `traveller-${i}`,
    fullName: t?.fullName || `Traveller ${i + 1}`,
    dateOfBirth: t?.dateOfBirth ?? null,
    gender: t?.gender ?? null,
    passportNumber: t?.passportNumber ?? null,
    passportExpiry: null,
    isLeadTraveller: Boolean(t?.isLeadTraveller),
  }));
}

function createHotelBookingFromPayload(body: CreateHotelBookingPayload): Booking {
  // Hotel context isn't in the payload (only the room id is) — a
  // representative stay stands in for it.
  const stay = mockHotels[0];
  const nights = 3;
  const pricePerNight = 6000;
  const bookingNumber = generateBookingNumber("HTL");
  const booking: Booking = {
    id: bookingNumber,
    bookingNumber,
    bookingType: "HOTEL",
    status: "PENDING",
    hotelName: stay?.name ?? "Ladakh Hotel",
    hotelSlug: stay?.slug ?? null,
    roomName: "Deluxe Mountain View",
    roomTypeName: "Deluxe Room",
    pricePerNight,
    nights,
    packageTitle: null,
    packageSlug: null,
    durationDays: null,
    durationNights: null,
    pricePerAdult: null,
    pricePerChild: null,
    cityName: stay?.cityName ?? "Leh",
    countryName: stay?.countryName ?? "India",
    startDate: body?.checkInDate || new Date().toISOString().slice(0, 10),
    endDate: body?.checkOutDate || new Date().toISOString().slice(0, 10),
    numberOfAdults: num(body?.numberOfAdults, 1),
    numberOfChildren: num(body?.numberOfChildren, 0),
    totalAmount: pricePerNight * nights,
    currencyCode: "INR",
    guestFullName: `${body?.guest?.firstName ?? ""} ${body?.guest?.lastName ?? ""}`.trim() || "Guest",
    guestEmail: body?.guest?.email || "guest@example.com",
    guestPhone: body?.guest?.phone || null,
    specialRequests: body?.specialRequests ?? null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date().toISOString(),
    travellers: synthesiseTravellers(body?.travellers),
    payment: null,
  };
  bookingStore.set(`${booking.bookingNumber}:${booking.guestEmail.toLowerCase()}`, booking);
  return booking;
}

function createPackageBookingFromPayload(body: CreatePackageBookingPayload): Booking {
  const pkg = mockPackages.find((p) => p.id === body?.packageId) ?? mockPackages[0];
  const bookingNumber = generateBookingNumber("PKG");
  const adults = num(body?.numberOfAdults, 1);
  const children = num(body?.numberOfChildren, 0);
  const pricePerAdult = pkg.discountPrice ?? pkg.price;
  const pricePerChild = Math.round(pricePerAdult * 0.7);
  const booking: Booking = {
    id: bookingNumber,
    bookingNumber,
    bookingType: "PACKAGE",
    status: "PENDING",
    hotelName: null,
    hotelSlug: null,
    roomName: null,
    roomTypeName: null,
    pricePerNight: null,
    nights: null,
    packageTitle: pkg.title,
    packageSlug: pkg.slug,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    pricePerAdult,
    pricePerChild,
    cityName: pkg.cityName,
    countryName: pkg.countryName,
    startDate: body?.travelDate || new Date().toISOString().slice(0, 10),
    endDate: body?.travelDate || new Date().toISOString().slice(0, 10),
    numberOfAdults: adults,
    numberOfChildren: children,
    totalAmount: pricePerAdult * adults + pricePerChild * children,
    currencyCode: pkg.currencyCode,
    guestFullName: `${body?.guest?.firstName ?? ""} ${body?.guest?.lastName ?? ""}`.trim() || "Guest",
    guestEmail: body?.guest?.email || "guest@example.com",
    guestPhone: body?.guest?.phone || null,
    specialRequests: body?.specialRequests ?? null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date().toISOString(),
    travellers: synthesiseTravellers(body?.travellers),
    payment: null,
  };
  bookingStore.set(`${booking.bookingNumber}:${booking.guestEmail.toLowerCase()}`, booking);
  return booking;
}

function lookupBooking(bookingNumber: string, email: string): Booking | null {
  const key = `${bookingNumber}:${email.toLowerCase()}`;
  return bookingStore.get(key) ?? null;
}

const routes: Route[] = [
  // --- home ---
  { method: "GET", pattern: /^\/public\/banners$/, handler: () => mockBanners },
  { method: "GET", pattern: /^\/public\/destinations\/popular$/, handler: ({ params }) => mockDestinations.slice(0, num(params.limit, 8)) },
  { method: "GET", pattern: /^\/public\/destinations$/, handler: () => mockDestinations },
  { method: "GET", pattern: /^\/public\/hotels\/top$/, handler: ({ params }) => mockHotels.slice(0, num(params.limit, 8)) },
  { method: "GET", pattern: /^\/public\/tour-packages\/best$/, handler: ({ params }) => mockBestPackages.slice(0, num(params.limit, 8)) },
  { method: "GET", pattern: /^\/public\/tour-packages\/offers$/, handler: ({ params }) => mockSpecialOffers.slice(0, num(params.limit, 6)) },
  { method: "GET", pattern: /^\/public\/testimonials\/featured$/, handler: ({ params }) => mockTestimonials.slice(0, num(params.limit, 6)) },
  { method: "GET", pattern: /^\/public\/blog-posts\/recent$/, handler: ({ params }) => mockBlogPosts.slice(0, num(params.limit, 6)) },
  { method: "GET", pattern: /^\/public\/faqs$/, handler: () => mockFaqs },
  { method: "GET", pattern: /^\/public\/settings$/, handler: () => mockPublicSettings },
  { method: "POST", pattern: /^\/public\/newsletter\/subscribe$/, handler: () => null },

  // --- hotels ---
  {
    method: "GET",
    pattern: /^\/public\/hotels$/,
    handler: ({ params }) =>
      paginate<HotelSummary>(filterBySearch(mockHotels, params.search, (h) => `${h.name} ${h.cityName}`), params),
  },
  { method: "GET", pattern: /^\/public\/amenities$/, handler: () => mockAmenities },
  { method: "GET", pattern: /^\/public\/hotels\/([^/]+)$/, handler: ({ match }) => findMockHotelDetail(match[1]) },

  // --- packages ---
  {
    method: "GET",
    pattern: /^\/public\/tour-packages$/,
    handler: ({ params }) =>
      paginate<TourPackageSummary>(filterBySearch(mockPackages, params.search, (p) => `${p.title} ${p.cityName}`), params),
  },
  { method: "GET", pattern: /^\/public\/tour-packages\/([^/]+)$/, handler: ({ match }) => findMockPackageDetail(match[1]) },

  // --- search ---
  {
    method: "GET",
    pattern: /^\/public\/search\/suggest$/,
    handler: ({ params }): SearchSuggestions => {
      const hits = searchMockHits(str(params.q));
      return {
        query: str(params.q),
        hotels: hits.filter((h) => h.type === "HOTEL"),
        packages: hits.filter((h) => h.type === "PACKAGE"),
        destinations: hits.filter((h) => h.type === "CITY"),
        countries: [],
        total: hits.length,
      };
    },
  },
  {
    method: "GET",
    pattern: /^\/public\/search$/,
    handler: ({ params }) => paginate<SearchHit>(searchMockHits(str(params.q)), params),
  },
  { method: "GET", pattern: /^\/public\/search\/popular$/, handler: ({ params }) => mockPopularSearches.slice(0, num(params.limit, 8)) },

  // --- bookings ---
  {
    method: "POST",
    pattern: /^\/public\/bookings\/hotel$/,
    handler: ({ body }) => createHotelBookingFromPayload(body as CreateHotelBookingPayload),
  },
  {
    method: "POST",
    pattern: /^\/public\/bookings\/package$/,
    handler: ({ body }) => createPackageBookingFromPayload(body as CreatePackageBookingPayload),
  },
  {
    method: "GET",
    pattern: /^\/public\/bookings\/history$/,
    handler: ({ params }) => {
      const booking = lookupBooking(str(params.bookingNumber), str(params.email));
      return booking ? [booking] : [];
    },
  },
  {
    method: "GET",
    pattern: /^\/public\/bookings\/([^/]+)$/,
    handler: ({ match, params }) => lookupBooking(match[1], str(params.email)),
  },

  // --- contact ---
  { method: "POST", pattern: /^\/public\/inquiries$/, handler: () => null },

  // --- cms (site-wide, server-fetched) ---
  { method: "GET", pattern: /^\/public\/cms\/site-content$/, handler: () => mockSiteContent },
  { method: "GET", pattern: /^\/public\/cms\/seo$/, handler: () => null },
  { method: "GET", pattern: /^\/public\/cms\/gallery$/, handler: () => mockGallery },
  { method: "GET", pattern: /^\/public\/cms\/blog\/([^/]+)$/, handler: ({ match }) => findMockBlogDetail(match[1]) },
  {
    method: "GET",
    pattern: /^\/public\/cms\/blog$/,
    handler: ({ params }) =>
      paginate(filterBySearch(mockBlogPosts, params.category, (p) => p.category), params),
  },

  // --- seo ---
  { method: "GET", pattern: /^\/public\/seo\/sitemap$/, handler: () => mockSitemapData },
];

const EMPTY_PAGE: PaginatedResponse<unknown> = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

/**
 * Anything not covered above is an admin/auth endpoint — unreachable in this
 * frontend-only build since AuthGuard never lets a token-less visitor reach a
 * page that would call one (see AuthGuard in features/auth/components). These
 * defaults exist only so a route never throws if it's ever hit directly.
 */
function fallback(method: string, path: string): MockResult {
  if (method === "GET") {
    // A handful of admin endpoints return a single object rather than a list;
    // an empty array there would break `.counts`/`.data` access on render.
    if (/\/dashboard\/stats$/.test(path)) {
      return {
        status: 200,
        data: {
          revenue: { total: 0, thisMonth: 0, lastMonth: 0, changePercent: null, currencyCode: "INR" },
          counts: {
            totalBookings: 0,
            pendingBookings: 0,
            totalCustomers: 0,
            newInquiries: 0,
            publishedHotels: mockHotels.length,
            publishedPackages: mockPackages.length,
            newsletterSubscribers: 0,
          },
          revenueByMonth: [],
          bookingsByStatus: [],
          topSellers: [],
          latestBookings: [],
        },
      };
    }
    if (/\/(bookings|inquiries|customers|newsletter|hotels|tour-packages|media)(\?|$)/.test(path)) {
      return { status: 200, data: EMPTY_PAGE };
    }
    return { status: 200, data: [] };
  }
  if (method === "DELETE") {
    return { status: 200, data: null };
  }
  // POST/PUT/PATCH: no real persistence to echo into, so this only exists to
  // keep an accidental call from throwing rather than to simulate a write.
  return { status: 200, data: null };
}

export function resolveMock(method: string, url: string, options: { params?: Params; body?: unknown } = {}): MockResult {
  const [pathname, search] = url.split("?");
  const params: Params = { ...options.params };
  if (search) {
    for (const [key, value] of new URLSearchParams(search)) {
      if (params[key] === undefined) params[key] = value;
    }
  }

  const upperMethod = method.toUpperCase();
  for (const route of routes) {
    if (route.method !== upperMethod) continue;
    const match = pathname.match(route.pattern);
    if (match) {
      return { status: 200, data: route.handler({ match, params, body: options.body }) };
    }
  }

  return fallback(upperMethod, pathname);
}
