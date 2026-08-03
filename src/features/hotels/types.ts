export type { HotelSummary } from "@/features/home/types";

export type AmenityCategory =
  | "GENERAL"
  | "ROOM"
  | "DINING"
  | "WELLNESS"
  | "BUSINESS"
  | "ACCESSIBILITY"
  | "FAMILY"
  | "OUTDOOR";

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category: AmenityCategory;
  displayOrder: number;
  isActive: boolean;
}

export interface HotelImage {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
}

export interface HotelRoom {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  name: string;
  description: string | null;
  maxAdults: number;
  maxChildren: number;
  bedCount: number;
  bedType: string | null;
  sizeSqm: number | null;
  pricePerNight: number;
  currencyCode: string;
  totalRooms: number;
  isActive: boolean;
  isAvailable: boolean;
}

export interface HotelDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  starRating: number | null;
  cityName: string;
  countryName: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  websiteUrl: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  basePrice: number;
  currencyCode: string;
  ratingAverage: number;
  ratingCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  images: HotelImage[];
  amenities: Amenity[];
  rooms: HotelRoom[];
}

export type HotelSortOption =
  | "recommended"
  | "priceAsc"
  | "priceDesc"
  | "ratingDesc"
  | "nameAsc";

export interface HotelListFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minStarRating?: number;
  amenityIds?: string[];
  sort?: HotelSortOption;
  page?: number;
  size?: number;
}
