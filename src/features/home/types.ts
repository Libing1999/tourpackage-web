export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonLabel: string | null;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  countryName: string;
  imageUrl: string | null;
  packageCount: number;
}

export interface HotelSummary {
  id: string;
  name: string;
  slug: string;
  cityName: string;
  countryName: string;
  coverImageUrl: string | null;
  starRating: number | null;
  ratingAverage: number;
  ratingCount: number;
  basePrice: number;
  currencyCode: string;
}

export interface TourPackageSummary {
  id: string;
  title: string;
  slug: string;
  cityName: string;
  countryName: string;
  coverImageUrl: string | null;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerAvatarUrl: string | null;
  customerCountryName: string | null;
  rating: number;
  message: string;
  packageTitle: string | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string;
  publishedAt: string;
  readTimeMinutes: number | null;
  authorName: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type PublicSettings = Record<string, string>;
