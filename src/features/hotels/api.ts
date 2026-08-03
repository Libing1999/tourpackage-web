import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { HotelSummary } from "@/features/home/types";
import type { Amenity, HotelDetail, HotelListFilters, HotelSortOption } from "./types";

const SORT_PARAM: Record<HotelSortOption, string | undefined> = {
  recommended: undefined,
  priceAsc: "basePrice,asc",
  priceDesc: "basePrice,desc",
  ratingDesc: "ratingAverage,desc",
  nameAsc: "name,asc",
};

export const hotelsApi = {
  list: (filters: HotelListFilters) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<HotelSummary>>>("/public/hotels", {
        params: {
          search: filters.search || undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minStarRating: filters.minStarRating,
          amenityIds: filters.amenityIds?.length ? filters.amenityIds : undefined,
          page: filters.page ?? 0,
          size: filters.size ?? 12,
          sort: filters.sort ? SORT_PARAM[filters.sort] : undefined,
        },
      })
      .then((res) => res.data.data),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<HotelDetail>>(`/public/hotels/${slug}`).then((res) => res.data.data),

  getAmenities: () =>
    apiClient.get<ApiResponse<Amenity[]>>("/public/amenities").then((res) => res.data.data),
};
