"use client";

import { Clock, Gauge, MapPin, Star, Users } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { MediaGallery } from "@/components/common/media-gallery";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDiscountPercent } from "@/utils/format";
import { usePackageDetail } from "../hooks/use-packages";
import { PackageItinerary } from "./package-itinerary";
import { PackageLineItems } from "./package-line-items";
import type { DifficultyLevel, TourPackageDetail } from "../types";

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  EXTREME: "Extreme",
};

interface PackageDetailContentProps {
  slug: string;
  initialPackage: TourPackageDetail;
}

export function PackageDetailContent({ slug, initialPackage }: PackageDetailContentProps) {
  const { data: pkg, isPending, isError } = usePackageDetail(slug, initialPackage);

  if (isPending) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Skeleton className="mb-4 h-8 w-2/3" />
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <p className="font-medium text-foreground">We couldn&apos;t load this package.</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again in a moment.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;
  const payablePrice = hasDiscount ? pkg.discountPrice! : pkg.price;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{pkg.title}</h1>
              {hasDiscount ? (
                <Badge variant="destructive">
                  {formatDiscountPercent(pkg.price, pkg.discountPrice!)}% OFF
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {pkg.cityName}, {pkg.countryName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {pkg.durationDays} days / {pkg.durationNights} nights
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="size-4" />
                {DIFFICULTY_LABELS[pkg.difficultyLevel]}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{pkg.ratingAverage.toFixed(1)}</span>
                <span>({pkg.ratingCount} reviews)</span>
              </span>
            </div>
          </div>

          <MediaGallery images={pkg.images} title={pkg.title} />

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-10">
              {pkg.summary || pkg.description ? (
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">Overview</h2>
                  {pkg.summary ? (
                    <p className="text-sm leading-relaxed text-foreground">{pkg.summary}</p>
                  ) : null}
                  {pkg.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {pkg.description}
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section>
                <h2 className="mb-5 text-lg font-semibold text-foreground">Itinerary</h2>
                <PackageItinerary days={pkg.itinerary} />
              </section>

              {pkg.includes.length > 0 || pkg.excludes.length > 0 ? (
                <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {pkg.includes.length > 0 ? (
                    <div>
                      <h2 className="mb-4 text-lg font-semibold text-foreground">What&apos;s Included</h2>
                      <PackageLineItems items={pkg.includes} variant="include" />
                    </div>
                  ) : null}
                  {pkg.excludes.length > 0 ? (
                    <div>
                      <h2 className="mb-4 text-lg font-semibold text-foreground">What&apos;s Not Included</h2>
                      <PackageLineItems items={pkg.excludes} variant="exclude" />
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border bg-background p-5">
                <p className="text-sm text-muted-foreground">
                  {hasDiscount ? "Now from" : "From"}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(payablePrice, pkg.currencyCode)}
                  </p>
                  {hasDiscount ? (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(pkg.price, pkg.currencyCode)}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">per person</p>

                <Separator className="my-4" />

                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="text-foreground">
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Difficulty</dt>
                    <dd className="text-foreground">{DIFFICULTY_LABELS[pkg.difficultyLevel]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5" /> Group size
                    </dt>
                    <dd className="text-foreground">
                      {pkg.maxGroupSize
                        ? `${pkg.minGroupSize} – ${pkg.maxGroupSize}`
                        : `${pkg.minGroupSize}+`}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/packages/${pkg.slug}/book`}
                  className={buttonVariants({ className: "mt-5 w-full" })}
                >
                  Book This Package
                </Link>
                <Link
                  href={`/contact?packageId=${pkg.id}&packageTitle=${encodeURIComponent(pkg.title)}`}
                  className={buttonVariants({ variant: "ghost", className: "mt-2 w-full" })}
                >
                  Ask About This Trip
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
