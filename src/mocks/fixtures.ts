/**
 * Static local data standing in for the API while USE_API is false (see
 * config/feature-flags.ts). Shaped to match the real response types exactly,
 * so every component renders the same way it would against a live backend —
 * only the transport changes. Themed to the site's actual subject (Leh
 * Ladakh tours) rather than being generic lorem-ipsum content.
 */
import type {
  Banner,
  Destination,
  Faq,
  HotelSummary,
  PublicSettings,
  Testimonial,
  TourPackageSummary,
  BlogPostSummary,
} from "@/features/home/types";
import type { Amenity, HotelDetail, HotelImage, HotelRoom } from "@/features/hotels/types";
import type {
  PackageImage,
  PackageItineraryDay,
  PackageLineItem,
  TourPackageDetail,
} from "@/features/packages/types";
import type { BlogPostDetail, GalleryImage, SiteContent } from "@/features/cms/types";
import type { SitemapData } from "@/features/seo/api";
import type { PopularSearch, SearchHit } from "@/features/search/types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// Square and cropped to the face, for the small round avatars; a plain crop
// leaves a full-length portrait's face a speck in the circle.
const face = (id: string) =>
  `https://images.unsplash.com/${id}?w=200&h=200&q=80&auto=format&fit=facearea&facepad=2.5`;

// Free photos under the Unsplash License, each chosen to show what its label
// names: the place itself where Unsplash has it, otherwise the kind of stay or
// activity. The trailing comment is the photo's page, unsplash.com/photos/<id>.
const PHOTOS = {
  // the home page hero keeps its original frame
  peaksAboveClouds: img("photo-1506905925346-21bda4d32df4"),
  // places
  lehPalaceAtDusk: img("photo-1706287040513-1019cd6173d1"), // 9G6pz9T2fF0
  nubraCamels: img("photo-1660303941192-575c686e9b05"), // wQ9-IpNOEnM
  hunderCamelRide: img("photo-1744118805778-34037a6386ed"), // SE1a8yZYrWU
  pangong: img("photo-1636800877579-b69375ae9532"), // MEaPZmSKyws
  pangongReflection: img("photo-1643138769032-34c831015c62"), // kSuScDOqJAo
  pangongShore: img("photo-1606857090627-27ca46667290"), // J_3681O7enY
  tsoMoriri: img("photo-1607890276967-31862551e0a3"), // jObamLEXGT8
  dalLakeShikaras: img("photo-1715457573748-8e8a70b2c1be"), // XHG0uFAlEGM
  kargilTown: img("photo-1568786701210-416f4df970f1"), // tnAogC-HnN4
  autumnValley: img("photo-1719385742336-1fd16f4d4314"), // T1molMrIZRs
  glacierValley: img("photo-1653101538620-f4fb698354b3"), // kpozQGZsJBk
  himalayanLake: img("photo-1768728410345-6327bf1cb6fc"), // vMY664KmN_8
  // monasteries
  thikseyWithChortens: img("photo-1747643607854-9f0d93c8c790"), // oe-R4ltNcj8
  thikseyHillside: img("photo-1651840622024-49a478967876"), // vYOjbzHys4A
  clifftopMonastery: img("photo-1744197068961-18194526c236"), // l_Gsf_31TIE
  hemisMonks: img("photo-1770463238793-7fb90e3e2676"), // 8jfu1mGQnWY
  // roads and treks
  bikeRider: img("photo-1762707232257-ab6057b4128b"), // zb8AE0rtghg
  highwayRider: img("photo-1670644654521-6fbfffeaba87"), // d9ZB6r_Q3n4
  khardungLaSign: img("photo-1636790132872-6319f4b378ad"), // 3bCJE_NAfHo
  openRoad: img("photo-1728723321081-872393671302"), // uCF-k4dQcKc
  chadarTrekkers: img("photo-1702704944450-0f3a575491a2"), // CSVOBqJyGCM
  frozenWaterfall: img("photo-1702296365554-b01164502e94"), // UE26vHLRnGM
  markhaTrekkers: img("photo-1778563333837-3b6b12554caf"), // VMqktTWBmW8
  trekkerOnRidge: img("photo-1604236480398-2c166ec6dbae"), // Rd9JKm0GxOo
  // night skies and camps
  nubraCampAtNight: img("photo-1534747498894-8511ef72d72c"), // 0w0yDBtxv6E
  tentUnderStars: img("photo-1758705023495-b64dfe01f970"), // R4NEEsb_Xh0
  starsOverRidge: img("photo-1721755514211-eca71feba369"), // DkJVvlTRx2c
  milkyWayOverMonastery: img("photo-1706191465084-0e2f89a148fa"), // FTUSP0ZH49I
  // stays
  roomWithSnowView: img("photo-1779547011126-c646b7de93b5"), // s7B6jin6pIM
  roomWithLakeView: img("photo-1761470371217-a4de0ff0e8df"), // n2vj0puCWTo
  roomWithBalcony: img("photo-1677160353599-5899a79ae439"), // 8tTatYH29DU
  swissTentCamp: img("photo-1563630136521-9f8b3336f09f"), // 8oB7HUfvK1o
  valleyLodgeTent: img("photo-1632367294096-4e77d53c4ae9"), // HpNcXyMfYzw
  bellTent: img("photo-1607908560428-36ff9e0363b7"), // lIWzmdpQXgc
  palaceFacade: img("photo-1741415990912-80db05801bce"), // Pi0zB7m5-wE
  // reviewers
  avatarAnanya: face("photo-1618245472177-2a74ad3b994a"), // RgDVFbXllVA
  avatarJames: face("photo-1592234789031-94bf65f630ed"), // H982yXJ7vOk
  avatarPriya: face("photo-1759840278381-bf7d5e332050"), // c07j-zSHezM
};

// --- destinations -----------------------------------------------------

export const mockDestinations: Destination[] = [
  { id: "dest-leh", name: "Leh", slug: "leh", countryName: "India", imageUrl: PHOTOS.lehPalaceAtDusk, packageCount: 6 },
  { id: "dest-nubra", name: "Nubra Valley", slug: "nubra-valley", countryName: "India", imageUrl: PHOTOS.nubraCamels, packageCount: 4 },
  { id: "dest-pangong", name: "Pangong Lake", slug: "pangong-lake", countryName: "India", imageUrl: PHOTOS.pangong, packageCount: 3 },
  { id: "dest-tsomoriri", name: "Tso Moriri", slug: "tso-moriri", countryName: "India", imageUrl: PHOTOS.tsoMoriri, packageCount: 2 },
  { id: "dest-srinagar", name: "Srinagar", slug: "srinagar", countryName: "India", imageUrl: PHOTOS.dalLakeShikaras, packageCount: 3 },
  { id: "dest-kargil", name: "Kargil", slug: "kargil", countryName: "India", imageUrl: PHOTOS.kargilTown, packageCount: 2 },
];

// --- hotels -------------------------------------------------------------

const hotelBase: Array<Omit<HotelSummary, "coverImageUrl"> & { image: string }> = [
  { id: "hotel-grand-dragon", name: "The Grand Dragon Ladakh", slug: "grand-dragon-ladakh", cityName: "Leh", countryName: "India", starRating: 5, ratingAverage: 4.7, ratingCount: 312, basePrice: 8500, currencyCode: "INR", image: PHOTOS.roomWithSnowView },
  { id: "hotel-nubra-eco", name: "Nubra Ecolodge", slug: "nubra-ecolodge", cityName: "Nubra Valley", countryName: "India", starRating: 4, ratingAverage: 4.5, ratingCount: 148, basePrice: 5200, currencyCode: "INR", image: PHOTOS.valleyLodgeTent },
  { id: "hotel-pangong-camp", name: "Pangong Retreat Camp", slug: "pangong-retreat-camp", cityName: "Pangong Lake", countryName: "India", starRating: 3, ratingAverage: 4.6, ratingCount: 201, basePrice: 4800, currencyCode: "INR", image: PHOTOS.swissTentCamp },
  { id: "hotel-lchang-nang", name: "Lchang Nang Retreat", slug: "lchang-nang-retreat", cityName: "Leh", countryName: "India", starRating: 4, ratingAverage: 4.4, ratingCount: 96, basePrice: 6100, currencyCode: "INR", image: PHOTOS.roomWithLakeView },
  { id: "hotel-ladakh-sarai", name: "Ladakh Sarai Resort", slug: "ladakh-sarai-resort", cityName: "Leh", countryName: "India", starRating: 4, ratingAverage: 4.3, ratingCount: 87, basePrice: 5600, currencyCode: "INR", image: PHOTOS.bellTent },
  { id: "hotel-stok-palace", name: "Stok Palace Heritage", slug: "stok-palace-heritage", cityName: "Leh", countryName: "India", starRating: 5, ratingAverage: 4.8, ratingCount: 64, basePrice: 9200, currencyCode: "INR", image: PHOTOS.palaceFacade },
];

export const mockHotels: HotelSummary[] = hotelBase.map(({ image, ...h }) => ({
  ...h,
  coverImageUrl: image,
}));

function hotelImages(cover: string): HotelImage[] {
  return [
    { id: `${cover}-1`, url: cover, altText: null, caption: null, displayOrder: 0, isCover: true },
    { id: `${cover}-2`, url: PHOTOS.roomWithBalcony, altText: null, caption: null, displayOrder: 1, isCover: false },
    { id: `${cover}-3`, url: PHOTOS.himalayanLake, altText: null, caption: null, displayOrder: 2, isCover: false },
  ];
}

export const mockAmenities: Amenity[] = [
  { id: "am-wifi", name: "Free Wi-Fi", slug: "wifi", icon: "wifi", category: "GENERAL", displayOrder: 0, isActive: true },
  { id: "am-parking", name: "Free Parking", slug: "parking", icon: "car", category: "GENERAL", displayOrder: 1, isActive: true },
  { id: "am-restaurant", name: "Restaurant", slug: "restaurant", icon: "utensils", category: "DINING", displayOrder: 2, isActive: true },
  { id: "am-heating", name: "Room Heating", slug: "heating", icon: "flame", category: "ROOM", displayOrder: 3, isActive: true },
  { id: "am-oxygen", name: "Oxygen Support", slug: "oxygen", icon: "wind", category: "WELLNESS", displayOrder: 4, isActive: true },
  { id: "am-bonfire", name: "Bonfire", slug: "bonfire", icon: "flame", category: "OUTDOOR", displayOrder: 5, isActive: true },
];

function hotelRooms(hotelId: string, basePrice: number, currencyCode: string): HotelRoom[] {
  return [
    {
      id: `${hotelId}-room-deluxe`,
      roomTypeId: "rt-deluxe",
      roomTypeName: "Deluxe Room",
      name: "Deluxe Mountain View",
      description: "Spacious room with a private balcony overlooking the mountains.",
      maxAdults: 2,
      maxChildren: 1,
      bedCount: 1,
      bedType: "King",
      sizeSqm: 28,
      pricePerNight: basePrice,
      currencyCode,
      totalRooms: 6,
      isActive: true,
      isAvailable: true,
    },
    {
      id: `${hotelId}-room-suite`,
      roomTypeId: "rt-suite",
      roomTypeName: "Suite",
      name: "Heritage Suite",
      description: "A larger suite with a sitting area, ideal for families.",
      maxAdults: 3,
      maxChildren: 2,
      bedCount: 2,
      bedType: "Twin",
      sizeSqm: 42,
      pricePerNight: Math.round(basePrice * 1.6),
      currencyCode,
      totalRooms: 3,
      isActive: true,
      isAvailable: true,
    },
  ];
}

export function findMockHotelDetail(slug: string): HotelDetail | null {
  const summary = hotelBase.find((h) => h.slug === slug);
  if (!summary) return null;
  return {
    id: summary.id,
    name: summary.name,
    slug: summary.slug,
    description:
      `${summary.name} sits in the heart of ${summary.cityName}, offering unobstructed Himalayan views, ` +
      "locally sourced dining, and easy access to the region's monasteries and trekking routes.",
    shortDescription: `Comfortable stay in ${summary.cityName} with Himalayan views.`,
    starRating: summary.starRating,
    cityName: summary.cityName,
    countryName: summary.countryName,
    addressLine1: `Old Leh Road, ${summary.cityName}`,
    addressLine2: null,
    postalCode: "194101",
    latitude: 34.1526,
    longitude: 77.5771,
    contactEmail: "stay@tourpackage.com",
    contactPhone: "+91 98765 43210",
    websiteUrl: null,
    checkInTime: "12:00",
    checkOutTime: "10:00",
    basePrice: summary.basePrice,
    currencyCode: summary.currencyCode,
    ratingAverage: summary.ratingAverage,
    ratingCount: summary.ratingCount,
    metaTitle: null,
    metaDescription: null,
    images: hotelImages(summary.image),
    amenities: mockAmenities,
    rooms: hotelRooms(summary.id, summary.basePrice, summary.currencyCode),
  };
}

// --- tour packages --------------------------------------------------------

const packageBase: Array<{
  id: string;
  title: string;
  slug: string;
  cityName: string;
  countryName: string;
  image: string;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
  difficultyLevel: TourPackageDetail["difficultyLevel"];
}> = [
  { id: "pkg-bike-expedition", title: "Leh Ladakh Bike Expedition", slug: "leh-ladakh-bike-expedition", cityName: "Leh", countryName: "India", image: PHOTOS.bikeRider, durationDays: 7, durationNights: 6, price: 32000, discountPrice: 27999, ratingAverage: 4.7, ratingCount: 184, difficultyLevel: "CHALLENGING" },
  { id: "pkg-nubra-pangong", title: "Nubra Valley & Pangong Lake Tour", slug: "nubra-valley-pangong-lake-tour", cityName: "Nubra Valley", countryName: "India", image: PHOTOS.pangongReflection, durationDays: 6, durationNights: 5, price: 24500, discountPrice: null, ratingAverage: 4.6, ratingCount: 142, difficultyLevel: "MODERATE" },
  { id: "pkg-complete-ladakh", title: "Complete Ladakh Discovery", slug: "complete-ladakh-discovery", cityName: "Leh", countryName: "India", image: PHOTOS.thikseyWithChortens, durationDays: 9, durationNights: 8, price: 41000, discountPrice: 36999, ratingAverage: 4.8, ratingCount: 96, difficultyLevel: "MODERATE" },
  { id: "pkg-chadar-trek", title: "Chadar Trek Adventure", slug: "chadar-trek-adventure", cityName: "Leh", countryName: "India", image: PHOTOS.chadarTrekkers, durationDays: 8, durationNights: 7, price: 38500, discountPrice: null, ratingAverage: 4.9, ratingCount: 58, difficultyLevel: "EXTREME" },
  { id: "pkg-markha-valley", title: "Markha Valley Trek", slug: "markha-valley-trek", cityName: "Leh", countryName: "India", image: PHOTOS.markhaTrekkers, durationDays: 6, durationNights: 5, price: 22000, discountPrice: 18999, ratingAverage: 4.5, ratingCount: 73, difficultyLevel: "CHALLENGING" },
  { id: "pkg-srinagar-leh", title: "Srinagar to Leh Road Trip", slug: "srinagar-to-leh-road-trip", cityName: "Srinagar", countryName: "India", image: PHOTOS.openRoad, durationDays: 10, durationNights: 9, price: 46000, discountPrice: 39999, ratingAverage: 4.6, ratingCount: 121, difficultyLevel: "MODERATE" },
];

const CURRENCY = "INR";

export const mockPackages: TourPackageSummary[] = packageBase.map((p) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  cityName: p.cityName,
  countryName: p.countryName,
  coverImageUrl: p.image,
  durationDays: p.durationDays,
  durationNights: p.durationNights,
  price: p.price,
  discountPrice: p.discountPrice,
  ratingAverage: p.ratingAverage,
  ratingCount: p.ratingCount,
  currencyCode: CURRENCY,
}));

export const mockBestPackages = mockPackages.slice(0, 4);
export const mockSpecialOffers = mockPackages.filter((p) => p.discountPrice !== null);

function packageImages(cover: string): PackageImage[] {
  return [
    { id: `${cover}-1`, url: cover, altText: null, caption: null, displayOrder: 0, isCover: true },
    { id: `${cover}-2`, url: PHOTOS.glacierValley, altText: null, caption: null, displayOrder: 1, isCover: false },
    { id: `${cover}-3`, url: PHOTOS.milkyWayOverMonastery, altText: null, caption: null, displayOrder: 2, isCover: false },
  ];
}

function packageItinerary(days: number, cityName: string): PackageItineraryDay[] {
  const titles = [
    `Arrival in ${cityName} & Acclimatisation`,
    "Local Monastery Circuit",
    "Scenic Drive & Photography Stops",
    "High-Altitude Lake Excursion",
    "Village Homestay Experience",
    "Free Day for Optional Activities",
    "Valley Trek",
    "Return Journey Preparation",
    "Departure",
  ];
  return Array.from({ length: days }, (_, i) => ({
    id: `${cityName}-day-${i + 1}`,
    dayNumber: i + 1,
    title: titles[i] ?? `Day ${i + 1}`,
    description:
      "A comfortably paced day with time built in for altitude acclimatisation, sightseeing, and rest.",
    cityId: null,
    cityName,
    meals: i === 0 ? "Dinner" : "Breakfast, Dinner",
    accommodation: i < days - 1 ? "Hotel / Camp" : null,
  }));
}

const includes: PackageLineItem[] = [
  { id: "inc-1", description: "Accommodation as per itinerary", icon: "bed", displayOrder: 0 },
  { id: "inc-2", description: "Daily breakfast and dinner", icon: "utensils", displayOrder: 1 },
  { id: "inc-3", description: "All ground transport in a private vehicle", icon: "car", displayOrder: 2 },
  { id: "inc-4", description: "Inner line permits and forest fees", icon: "file-check", displayOrder: 3 },
  { id: "inc-5", description: "Experienced driver-cum-guide", icon: "user", displayOrder: 4 },
];

const excludes: PackageLineItem[] = [
  { id: "exc-1", description: "Flights to and from Leh", icon: "plane", displayOrder: 0 },
  { id: "exc-2", description: "Lunches and personal expenses", icon: "coffee", displayOrder: 1 },
  { id: "exc-3", description: "Travel insurance", icon: "shield", displayOrder: 2 },
  { id: "exc-4", description: "Anything not mentioned under inclusions", icon: "x", displayOrder: 3 },
];

export function findMockPackageDetail(slug: string): TourPackageDetail | null {
  const summary = packageBase.find((p) => p.slug === slug);
  if (!summary) return null;
  return {
    id: summary.id,
    title: summary.title,
    slug: summary.slug,
    summary: `${summary.durationDays} days of ${summary.cityName}'s best landscapes, monasteries, and mountain passes.`,
    description:
      `${summary.title} takes you through some of the most dramatic high-altitude landscapes in the ` +
      "world — glacial lakes, ancient monasteries, and villages that have changed little in centuries. " +
      "Paced for safe acclimatisation, with comfortable stays each night.",
    countryName: summary.countryName,
    cityName: summary.cityName,
    durationDays: summary.durationDays,
    durationNights: summary.durationNights,
    price: summary.price,
    discountPrice: summary.discountPrice,
    pricePerAdult: summary.discountPrice ?? summary.price,
    pricePerChild: Math.round((summary.discountPrice ?? summary.price) * 0.7),
    currencyCode: CURRENCY,
    minGroupSize: 2,
    maxGroupSize: 12,
    difficultyLevel: summary.difficultyLevel,
    ratingAverage: summary.ratingAverage,
    ratingCount: summary.ratingCount,
    metaTitle: null,
    metaDescription: null,
    images: packageImages(summary.image),
    itinerary: packageItinerary(summary.durationDays, summary.cityName),
    includes,
    excludes,
  };
}

// --- banners / testimonials / blog / faqs ----------------------------------

export const mockBanners: Banner[] = [
  { id: "banner-1", title: "Discover the Roof of the World", subtitle: "Handcrafted Ladakh journeys, from bike expeditions to gentle valley tours.", imageUrl: PHOTOS.peaksAboveClouds, linkUrl: "/packages", buttonLabel: "Explore Packages" },
  { id: "banner-2", title: "Camp Under a Million Stars", subtitle: "Pangong Lake and Nubra Valley camping experiences.", imageUrl: PHOTOS.tentUnderStars, linkUrl: "/packages", buttonLabel: "View Offers" },
  { id: "banner-3", title: "Monasteries, Mountains & More", subtitle: "Curated hotels and homestays across Leh Ladakh.", imageUrl: PHOTOS.clifftopMonastery, linkUrl: "/hotels", buttonLabel: "Browse Hotels" },
];

export const mockTestimonials: Testimonial[] = [
  { id: "test-1", customerName: "Ananya Sharma", customerAvatarUrl: PHOTOS.avatarAnanya, customerCountryName: "India", rating: 5, message: "The bike expedition was flawlessly organised — every pass, every stay, sorted. Best trip of my life.", packageTitle: "Leh Ladakh Bike Expedition" },
  { id: "test-2", customerName: "James Whitfield", customerAvatarUrl: PHOTOS.avatarJames, customerCountryName: "United Kingdom", rating: 5, message: "Pangong Lake at sunset, exactly as promised. Our guide knew every viewpoint worth stopping for.", packageTitle: "Nubra Valley & Pangong Lake Tour" },
  { id: "test-3", customerName: "Priya Nair", customerAvatarUrl: PHOTOS.avatarPriya, customerCountryName: "India", rating: 4, message: "Chadar trek pushed us to our limits in the best way. The crew's experience really showed.", packageTitle: "Chadar Trek Adventure" },
];

export const mockBlogPosts: BlogPostSummary[] = [
  { id: "blog-1", title: "Best Time to Visit Ladakh: A Season-by-Season Guide", slug: "best-time-to-visit-ladakh", excerpt: "From spring blossoms to winter's frozen river, here's when to go and why.", coverImageUrl: PHOTOS.autumnValley, category: "Travel Tips", publishedAt: "2026-03-14T09:00:00Z", readTimeMinutes: 6, authorName: "Tashi Dorjay" },
  { id: "blog-2", title: "Top 5 Treks in Ladakh for First-Timers", slug: "top-5-treks-in-ladakh", excerpt: "Markha Valley to Stok Kangri — a ranked guide for every fitness level.", coverImageUrl: PHOTOS.trekkerOnRidge, category: "Trekking", publishedAt: "2026-02-02T09:00:00Z", readTimeMinutes: 8, authorName: "Rinchen Angmo" },
  { id: "blog-3", title: "The Complete Chadar Trek Survival Guide", slug: "chadar-trek-survival-guide", excerpt: "What to pack, how to acclimatise, and what nobody tells you about the frozen river.", coverImageUrl: PHOTOS.frozenWaterfall, category: "Trekking", publishedAt: "2026-01-18T09:00:00Z", readTimeMinutes: 10, authorName: "Tashi Dorjay" },
  { id: "blog-4", title: "Monastery Hopping: A One-Day Leh Itinerary", slug: "monastery-hopping-leh-itinerary", excerpt: "Hemis, Thiksey, and Shey — the loop that fits neatly into a single day.", coverImageUrl: PHOTOS.hemisMonks, category: "Culture", publishedAt: "2025-12-21T09:00:00Z", readTimeMinutes: 5, authorName: "Rinchen Angmo" },
];

export function findMockBlogDetail(slug: string): BlogPostDetail | null {
  const summary = mockBlogPosts.find((p) => p.slug === slug);
  if (!summary) return null;
  return {
    id: summary.id,
    title: summary.title,
    slug: summary.slug,
    excerpt: summary.excerpt,
    content: `<p>${summary.excerpt}</p><p>This is placeholder local content standing in for the full article while the site runs without a live backend. Once the API is reconnected, this page will render the real post body.</p>`,
    coverImageUrl: summary.coverImageUrl,
    category: summary.category,
    publishedAt: summary.publishedAt,
    readTimeMinutes: summary.readTimeMinutes,
    authorName: summary.authorName,
  };
}

export const mockFaqs: Faq[] = [
  { id: "faq-1", question: "Do I need a permit to visit Ladakh?", answer: "Indian nationals need an Inner Line Permit for certain areas like Nubra and Pangong, which we arrange as part of every package. Foreign nationals need a Protected Area Permit, also handled by our team.", category: "Permits" },
  { id: "faq-2", question: "How do I deal with altitude sickness?", answer: "We build in acclimatisation days on every itinerary, recommend arriving a day early in Leh, and keep oxygen support available at partner hotels.", category: "Health" },
  { id: "faq-3", question: "What's the best time of year to travel?", answer: "May through September for most routes; the Chadar trek runs in January and February when the river is fully frozen.", category: "Planning" },
  { id: "faq-4", question: "Can I customise an itinerary?", answer: "Yes — every package can be adjusted for duration, group size, or route. Reach out via the contact page with what you have in mind.", category: "Booking" },
  { id: "faq-5", question: "What is the cancellation policy?", answer: "Full refund up to 15 days before departure, 50% up to 7 days before, and no refund inside 7 days. Force-majeure cases are handled individually.", category: "Booking" },
];

export const mockPublicSettings: PublicSettings = {
  site_name: "TourPackage Ladakh",
  site_tagline: "Leh Ladakh tours, treks, and camping trips across the Himalayas.",
  contact_email: "hello@tourpackage.com",
  contact_phone: "+91 98765 43210",
  contact_whatsapp: "+919876543210",
  contact_address: "Fort Road, Leh, Ladakh 194101, India",
  social_facebook: "https://facebook.com/tourpackageladakh",
  social_instagram: "https://instagram.com/tourpackageladakh",
  social_twitter: "https://twitter.com/tourpackageladakh",
  social_youtube: "",
};

// --- CMS: site-wide nav + content blocks -----------------------------------

export const mockSiteContent: SiteContent = {
  blocks: {
    "home.destinations": { id: "blk-1", key: "home.destinations", eyebrow: "Explore", title: "Popular Destinations", subtitle: "The places every Ladakh trip is built around.", body: null, isActive: true },
    "home.hotels": { id: "blk-2", key: "home.hotels", eyebrow: "Stay", title: "Top Rated Hotels & Camps", subtitle: "Comfortable bases for high-altitude adventure.", body: null, isActive: true },
    "home.packages": { id: "blk-3", key: "home.packages", eyebrow: "Journeys", title: "Best Selling Packages", subtitle: "Our most-booked itineraries, end to end.", body: null, isActive: true },
    "home.offers": { id: "blk-4", key: "home.offers", eyebrow: "Save More", title: "Special Offers", subtitle: "Limited-time pricing on select departures.", body: null, isActive: true },
    "home.testimonials": { id: "blk-5", key: "home.testimonials", eyebrow: "Reviews", title: "What Travellers Say", subtitle: null, body: null, isActive: true },
    "home.blog": { id: "blk-6", key: "home.blog", eyebrow: "Journal", title: "From the Travel Blog", subtitle: "Guides, tips, and stories from the mountains.", body: null, isActive: true },
    "home.faq": { id: "blk-7", key: "home.faq", eyebrow: "Help", title: "Frequently Asked Questions", subtitle: null, body: null, isActive: true },
    "home.newsletter": { id: "blk-8", key: "home.newsletter", eyebrow: null, title: "Get Trip Ideas in Your Inbox", subtitle: "Occasional emails, no spam.", body: null, isActive: true },
    "page.packages": { id: "blk-9", key: "page.packages", eyebrow: null, title: "Tour Packages", subtitle: "Find the itinerary that fits your trip.", body: null, isActive: true },
    "page.hotels": { id: "blk-10", key: "page.hotels", eyebrow: null, title: "Hotels & Camps", subtitle: "Comfortable stays across Ladakh.", body: null, isActive: true },
    "page.gallery": { id: "blk-11", key: "page.gallery", eyebrow: null, title: "Gallery", subtitle: "A look at the landscapes you'll travel through.", body: null, isActive: true },
    "page.contact": { id: "blk-12", key: "page.contact", eyebrow: null, title: "Get in Touch", subtitle: "Questions about a trip? We usually reply within a day.", body: null, isActive: true },
    "page.bookings": { id: "blk-13", key: "page.bookings", eyebrow: null, title: "Manage Your Booking", subtitle: "Look up a booking with your reference number and email.", body: null, isActive: true },
    "footer.tagline": { id: "blk-14", key: "footer.tagline", eyebrow: null, title: null, subtitle: "Leh Ladakh tours, treks, and camping trips across the Himalayas.", body: null, isActive: true },
  },
  header: [
    { id: "nav-1", navGroup: "HEADER", label: "Home", href: "/", displayOrder: 0, isActive: true },
    { id: "nav-2", navGroup: "HEADER", label: "Packages", href: "/packages", displayOrder: 1, isActive: true },
    { id: "nav-3", navGroup: "HEADER", label: "Hotels", href: "/hotels", displayOrder: 2, isActive: true },
    { id: "nav-4", navGroup: "HEADER", label: "Blog", href: "/blog", displayOrder: 3, isActive: true },
    { id: "nav-5", navGroup: "HEADER", label: "Gallery", href: "/gallery", displayOrder: 4, isActive: true },
    { id: "nav-6", navGroup: "HEADER", label: "Contact", href: "/contact", displayOrder: 5, isActive: true },
  ],
  footer: [
    { id: "fnav-1", navGroup: "FOOTER", label: "About Us", href: "/contact", displayOrder: 0, isActive: true },
    { id: "fnav-2", navGroup: "FOOTER", label: "Packages", href: "/packages", displayOrder: 1, isActive: true },
    { id: "fnav-3", navGroup: "FOOTER", label: "Hotels", href: "/hotels", displayOrder: 2, isActive: true },
    { id: "fnav-4", navGroup: "FOOTER", label: "Manage Booking", href: "/bookings", displayOrder: 3, isActive: true },
  ],
};

export const mockGallery: GalleryImage[] = [
  { id: "gal-1", url: PHOTOS.highwayRider, altText: "A motorbike on the highway through snow-capped mountains", caption: "Leh-Manali Highway", category: "Landscape", displayOrder: 0, isActive: true },
  { id: "gal-2", url: PHOTOS.pangongShore, altText: "Travellers on the shore of Pangong Lake", caption: "Pangong Tso", category: "Landscape", displayOrder: 1, isActive: true },
  { id: "gal-3", url: PHOTOS.thikseyHillside, altText: "Thiksey Monastery climbing its hillside", caption: "Thiksey Monastery", category: "Culture", displayOrder: 2, isActive: true },
  { id: "gal-4", url: PHOTOS.nubraCampAtNight, altText: "The Milky Way over a camp among poplars", caption: "Nubra Valley camp", category: "Camping", displayOrder: 3, isActive: true },
  { id: "gal-5", url: PHOTOS.hunderCamelRide, altText: "A caravan of double-humped camels crossing the dunes", caption: "Hunder Dunes", category: "Landscape", displayOrder: 4, isActive: true },
  { id: "gal-6", url: PHOTOS.starsOverRidge, altText: "Starry night sky over the mountains", caption: "Night sky at Pangong", category: "Landscape", displayOrder: 5, isActive: true },
  { id: "gal-7", url: PHOTOS.markhaTrekkers, altText: "Two trekkers on a rocky valley trail", caption: "Markha Valley trail", category: "Trekking", displayOrder: 6, isActive: true },
  { id: "gal-8", url: PHOTOS.khardungLaSign, altText: "The Khardung La viewpoint sign above the valley", caption: "Khardung La Pass", category: "Adventure", displayOrder: 7, isActive: true },
];

// --- search -----------------------------------------------------------------

export const mockPopularSearches: PopularSearch[] = [
  { term: "Pangong Lake", searchCount: 214 },
  { term: "Nubra Valley", searchCount: 178 },
  { term: "Chadar Trek", searchCount: 133 },
  { term: "Leh hotels", searchCount: 97 },
];

export function searchMockHits(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hotelHits: SearchHit[] = mockHotels
    .filter((h) => h.name.toLowerCase().includes(q) || h.cityName.toLowerCase().includes(q))
    .map((h) => ({ type: "HOTEL", id: h.id, title: h.name, subtitle: h.cityName, imageUrl: h.coverImageUrl, url: `/hotels/${h.slug}` }));

  const packageHits: SearchHit[] = mockPackages
    .filter((p) => p.title.toLowerCase().includes(q) || p.cityName.toLowerCase().includes(q))
    .map((p) => ({ type: "PACKAGE", id: p.id, title: p.title, subtitle: `${p.durationDays}D/${p.durationNights}N`, imageUrl: p.coverImageUrl, url: `/packages/${p.slug}` }));

  const destinationHits: SearchHit[] = mockDestinations
    .filter((d) => d.name.toLowerCase().includes(q))
    .map((d) => ({ type: "CITY", id: d.id, title: d.name, subtitle: d.countryName, imageUrl: d.imageUrl, url: `/packages?cityId=${d.id}` }));

  return [...hotelHits, ...packageHits, ...destinationHits];
}

// --- sitemap -----------------------------------------------------------------

export const mockSitemapData: SitemapData = {
  hotels: hotelBase.map((h) => ({ slug: h.slug, updatedAt: new Date().toISOString() })),
  packages: packageBase.map((p) => ({ slug: p.slug, updatedAt: new Date().toISOString() })),
  blogPosts: mockBlogPosts.map((b) => ({ slug: b.slug, updatedAt: b.publishedAt })),
};
