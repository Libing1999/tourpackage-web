"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { hotelsApi } from "../api";
import type { HotelDetail, HotelListFilters } from "../types";

const STALE_TIME_MS = 60 * 1000;
const AMENITIES_STALE_TIME_MS = 5 * 60 * 1000;

export const hotelsKeys = {
  list: (filters: HotelListFilters) => ["hotels", "list", filters] as const,
  detail: (slug: string) => ["hotels", "detail", slug] as const,
  amenities: ["hotels", "amenities"] as const,
};

export function useHotelsList(filters: HotelListFilters) {
  return useQuery({
    queryKey: hotelsKeys.list(filters),
    queryFn: () => hotelsApi.list(filters),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}

export function useHotelDetail(slug: string, initialData?: HotelDetail) {
  return useQuery({
    queryKey: hotelsKeys.detail(slug),
    queryFn: () => hotelsApi.getBySlug(slug),
    staleTime: STALE_TIME_MS,
    enabled: Boolean(slug),
    initialData,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: hotelsKeys.amenities,
    queryFn: hotelsApi.getAmenities,
    staleTime: AMENITIES_STALE_TIME_MS,
  });
}
