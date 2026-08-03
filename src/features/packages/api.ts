import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Destination, TourPackageSummary } from "@/features/home/types";
import type { PackageListFilters, PackageSortOption, TourPackageDetail } from "./types";

const SORT_PARAM: Record<PackageSortOption, string | undefined> = {
  recommended: undefined,
  priceAsc: "price,asc",
  priceDesc: "price,desc",
  ratingDesc: "ratingAverage,desc",
  durationAsc: "durationDays,asc",
  durationDesc: "durationDays,desc",
};

export const packagesApi = {
  list: (filters: PackageListFilters) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<TourPackageSummary>>>("/public/tour-packages", {
        params: {
          search: filters.search || undefined,
          cityId: filters.cityId,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minDurationDays: filters.minDurationDays,
          maxDurationDays: filters.maxDurationDays,
          difficultyLevel: filters.difficultyLevel,
          discountedOnly: filters.discountedOnly ? true : undefined,
          page: filters.page ?? 0,
          size: filters.size ?? 12,
          sort: filters.sort ? SORT_PARAM[filters.sort] : undefined,
        },
      })
      .then((res) => res.data.data),

  getBySlug: (slug: string) =>
    apiClient
      .get<ApiResponse<TourPackageDetail>>(`/public/tour-packages/${slug}`)
      .then((res) => res.data.data),

  getDestinations: () =>
    apiClient.get<ApiResponse<Destination[]>>("/public/destinations").then((res) => res.data.data),
};
