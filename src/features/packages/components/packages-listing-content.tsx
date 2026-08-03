"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination } from "@/components/common/pagination";
import { useBlock } from "@/features/cms/site-content-provider";
import { Reveal } from "@/components/common/reveal";
import { CardGridSkeleton } from "@/features/home/components/card-grid-skeleton";
import { PackageCard } from "@/features/home/components/package-card";
import { usePackagesList } from "../hooks/use-packages";
import { PackageFilters, type PackageFiltersValue } from "./package-filters";
import { PackageSortSelect } from "./package-sort-select";
import type { DifficultyLevel, PackageListFilters, PackageSortOption } from "../types";

const PAGE_SIZE = 12;

function parseFilters(params: URLSearchParams): PackageListFilters {
  return {
    search: params.get("q") ?? undefined,
    cityId: params.get("city") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    minDurationDays: params.get("minDays") ? Number(params.get("minDays")) : undefined,
    maxDurationDays: params.get("maxDays") ? Number(params.get("maxDays")) : undefined,
    difficultyLevel: (params.get("difficulty") as DifficultyLevel | null) ?? undefined,
    discountedOnly: params.get("offers") === "1" ? true : undefined,
    sort: (params.get("sort") as PackageSortOption | null) ?? "recommended",
    page: params.get("page") ? Number(params.get("page")) : 0,
    size: PAGE_SIZE,
  };
}

function toSearchParams(filters: PackageListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.cityId) params.set("city", filters.cityId);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minDurationDays !== undefined) params.set("minDays", String(filters.minDurationDays));
  if (filters.maxDurationDays !== undefined) params.set("maxDays", String(filters.maxDurationDays));
  if (filters.difficultyLevel) params.set("difficulty", filters.difficultyLevel);
  if (filters.discountedOnly) params.set("offers", "1");
  if (filters.sort && filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  return params;
}

export function PackagesListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const heading = useBlock("page.packages");

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchInput(filters.search ?? "");
  }, [filters.search]);

  const updateFilters = useCallback(
    (patch: Partial<PackageListFilters>, resetPage = true) => {
      const next: PackageListFilters = {
        ...filters,
        ...patch,
        page: resetPage ? 0 : (patch.page ?? filters.page),
      };
      const query = toSearchParams(next).toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [filters, pathname, router]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== (filters.search ?? "")) {
        updateFilters({ search: searchInput || undefined });
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isPending, isError } = usePackagesList(filters);

  const filtersValue: PackageFiltersValue = {
    cityId: filters.cityId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minDurationDays: filters.minDurationDays,
    maxDurationDays: filters.maxDurationDays,
    difficultyLevel: filters.difficultyLevel,
    discountedOnly: filters.discountedOnly,
  };

  const filterPanel = (
    <PackageFilters
      value={filtersValue}
      onChange={(patch) => updateFilters(patch)}
      onClear={() =>
        updateFilters({
          cityId: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minDurationDays: undefined,
          maxDurationDays: undefined,
          difficultyLevel: undefined,
          discountedOnly: undefined,
        })
      }
    />
  );

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{heading?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {isPending ? "Searching packages…" : `${data?.totalElements ?? 0} packages found`}
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by package, city, or country…"
                className="h-10 pl-8"
                aria-label="Search packages"
              />
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal /> Filters
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-4">{filterPanel}</div>
                </SheetContent>
              </Sheet>

              <PackageSortSelect
                value={filters.sort ?? "recommended"}
                onChange={(sort) => updateFilters({ sort })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border bg-background p-5">{filterPanel}</div>
            </aside>

            <div className="flex flex-col gap-8">
              {isError ? (
                <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                  Something went wrong loading packages. Please try again.
                </p>
              ) : isPending ? (
                <CardGridSkeleton
                  count={PAGE_SIZE}
                  cardClassName="aspect-auto h-72"
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                />
              ) : data && data.content.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {data.content.map((pkg, i) => (
                      <Reveal key={pkg.id} delayMs={Math.min(i, 6) * 60}>
                        <Link href={`/packages/${pkg.slug}`} className="block">
                          <PackageCard pkg={pkg} />
                        </Link>
                      </Reveal>
                    ))}
                  </div>

                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(page) => updateFilters({ page }, false)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-16 text-center">
                  <p className="font-medium text-foreground">No packages match your filters</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
