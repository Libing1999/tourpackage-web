"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { packagesApi } from "../api";
import type { PackageListFilters, TourPackageDetail } from "../types";

const STALE_TIME_MS = 60 * 1000;

const DESTINATIONS_STALE_TIME_MS = 5 * 60 * 1000;

export const packagesKeys = {
  list: (filters: PackageListFilters) => ["packages", "list", filters] as const,
  detail: (slug: string) => ["packages", "detail", slug] as const,
  destinations: ["packages", "destinations"] as const,
};

export function usePackagesList(filters: PackageListFilters) {
  return useQuery({
    queryKey: packagesKeys.list(filters),
    queryFn: () => packagesApi.list(filters),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}

export function usePackageDetail(slug: string, initialData?: TourPackageDetail) {
  return useQuery({
    queryKey: packagesKeys.detail(slug),
    queryFn: () => packagesApi.getBySlug(slug),
    staleTime: STALE_TIME_MS,
    enabled: Boolean(slug),
    initialData,
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: packagesKeys.destinations,
    queryFn: packagesApi.getDestinations,
    staleTime: DESTINATIONS_STALE_TIME_MS,
  });
}
