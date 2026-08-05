export type { TourPackageSummary } from "@/features/home/types";

export type DifficultyLevel = "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME";

export interface PackageImage {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
}

export interface PackageItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  cityId: string | null;
  cityName: string | null;
  meals: string | null;
  accommodation: string | null;
}

export interface PackageLineItem {
  id: string;
  description: string;
  icon: string | null;
  displayOrder: number;
}

export interface TourPackageDetail {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  countryName: string;
  cityName: string;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice: number | null;
  /** Effective per-person rates, resolved server-side — see PackagePricing. */
  pricePerAdult: number;
  pricePerChild: number;
  currencyCode: string;
  minGroupSize: number;
  maxGroupSize: number | null;
  difficultyLevel: DifficultyLevel;
  ratingAverage: number;
  ratingCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  images: PackageImage[];
  itinerary: PackageItineraryDay[];
  includes: PackageLineItem[];
  excludes: PackageLineItem[];
}

export type PackageSortOption =
  | "recommended"
  | "priceAsc"
  | "priceDesc"
  | "ratingDesc"
  | "durationAsc"
  | "durationDesc";

export interface PackageListFilters {
  search?: string;
  cityId?: string;
  countryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDurationDays?: number;
  maxDurationDays?: number;
  difficultyLevel?: DifficultyLevel;
  discountedOnly?: boolean;
  sort?: PackageSortOption;
  page?: number;
  size?: number;
}
