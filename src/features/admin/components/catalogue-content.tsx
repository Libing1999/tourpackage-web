"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageContent } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  useAdminHotels,
  useAdminPackages,
  useDeleteHotel,
  useDeletePackage,
} from "../hooks/use-admin";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";
import { StatusSelect } from "./status-select";

type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
const STATUSES: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};
const STATUS_CLASSES: Record<ContentStatus, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  DRAFT: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge className={cn(STATUS_CLASSES[status])}>{LABELS[status]}</Badge>;
}

export function HotelsContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const [status, setStatus] = useState<ContentStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminHotels({ status, search: search || undefined, page, size: 15 });
  const deleteHotel = useDeleteHotel();

  return (
    <>
      <AdminPageHeader title="Hotels" description="Properties available to book." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search hotels…"
            className="h-9 pl-8"
            aria-label="Search hotels"
          />
        </div>
        <StatusSelect
          value={status}
          options={STATUSES}
          labels={LABELS}
          anyLabel="All statuses"
          ariaLabel="Filter hotels by status"
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        />
      </div>

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.content.length === 0}
        emptyMessage="No hotels match these filters."
      >
        <AdminTable
          head={
            <>
              <th>Hotel</th>
              <th>Location</th>
              <th className="text-right">From</th>
              <th>Rating</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </>
          }
        >
          {data?.content.map((hotel) => (
            <tr key={hotel.id} className="hover:bg-muted/40">
              <td>
                <p className="font-medium text-foreground">{hotel.name}</p>
                {hotel.isFeatured ? (
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Featured
                  </Badge>
                ) : null}
              </td>
              <td className="text-muted-foreground">
                {hotel.cityName}, {hotel.countryName}
              </td>
              <td className="text-right whitespace-nowrap">
                {formatCurrency(hotel.basePrice, hotel.currencyCode)}
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {hotel.ratingAverage.toFixed(1)} ({hotel.ratingCount})
              </td>
              <td>
                <StatusBadge status={hotel.status} />
              </td>
              <td>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/hotels/${hotel.slug}`} target="_blank">
                    <Button variant="ghost" size="icon-sm" aria-label={`View ${hotel.name}`}>
                      <ExternalLink />
                    </Button>
                  </Link>
                  {canManage ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${hotel.name}`}
                      disabled={deleteHotel.isPending}
                      onClick={() => {
                        if (!confirm(`Delete "${hotel.name}"? This hides it from the site.`)) return;
                        deleteHotel.mutate(hotel.id, {
                          onSuccess: () => toast.success("Hotel deleted"),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        });
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        {data ? (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} className="mt-5" />
        ) : null}
      </AdminListState>
    </>
  );
}

export function PackagesContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const [status, setStatus] = useState<ContentStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminPackages({
    status,
    search: search || undefined,
    page,
    size: 15,
  });
  const deletePackage = useDeletePackage();

  return (
    <>
      <AdminPageHeader title="Packages" description="Tour packages available to book." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search packages…"
            className="h-9 pl-8"
            aria-label="Search packages"
          />
        </div>
        <StatusSelect
          value={status}
          options={STATUSES}
          labels={LABELS}
          anyLabel="All statuses"
          ariaLabel="Filter packages by status"
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        />
      </div>

      <AdminListState
        isPending={isPending}
        isError={isError}
        isEmpty={!data || data.content.length === 0}
        emptyMessage="No packages match these filters."
      >
        <AdminTable
          head={
            <>
              <th>Package</th>
              <th>Destination</th>
              <th>Duration</th>
              <th className="text-right">Price</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </>
          }
        >
          {data?.content.map((pkg) => (
            <tr key={pkg.id} className="hover:bg-muted/40">
              <td>
                <p className="font-medium text-foreground">{pkg.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {pkg.difficultyLevel.toLowerCase()}
                </p>
              </td>
              <td className="text-muted-foreground">
                {pkg.cityName}, {pkg.countryName}
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {pkg.durationDays}D / {pkg.durationNights}N
              </td>
              <td className="text-right whitespace-nowrap">
                {pkg.discountPrice ? (
                  <>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(pkg.price, pkg.currencyCode)}
                    </span>{" "}
                    <span className="font-medium">
                      {formatCurrency(pkg.discountPrice, pkg.currencyCode)}
                    </span>
                  </>
                ) : (
                  formatCurrency(pkg.price, pkg.currencyCode)
                )}
              </td>
              <td>
                <StatusBadge status={pkg.status} />
              </td>
              <td>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/packages/${pkg.slug}`} target="_blank">
                    <Button variant="ghost" size="icon-sm" aria-label={`View ${pkg.title}`}>
                      <ExternalLink />
                    </Button>
                  </Link>
                  {canManage ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${pkg.title}`}
                      disabled={deletePackage.isPending}
                      onClick={() => {
                        if (!confirm(`Delete "${pkg.title}"? This hides it from the site.`)) return;
                        deletePackage.mutate(pkg.id, {
                          onSuccess: () => toast.success("Package deleted"),
                          onError: (error) => toast.error(getErrorMessage(error)),
                        });
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        {data ? (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} className="mt-5" />
        ) : null}
      </AdminListState>
    </>
  );
}
