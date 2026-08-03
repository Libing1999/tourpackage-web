"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck,
  Mail,
  Package,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "../hooks/use-admin";
import { AdminPageHeader, AdminTable } from "./admin-page";
import { BookingStatusDonut, RevenueBarChart } from "./charts";

function RevenueCard({
  label,
  value,
  changePercent,
  emphasis,
}: {
  label: string;
  value: string;
  changePercent?: number | null;
  emphasis?: boolean;
}) {
  const up = changePercent !== null && changePercent !== undefined && changePercent >= 0;

  return (
    <Card className={cn(emphasis && "border-primary/30 bg-primary/5")}>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
        {changePercent !== undefined ? (
          changePercent === null ? (
            <p className="mt-1.5 text-xs text-muted-foreground">No revenue last month to compare</p>
          ) : (
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs",
                up ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(changePercent)}% vs last month
            </p>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  href: string;
  hint?: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/40">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground">{value}</p>
            <p className="truncate text-xs text-muted-foreground">{hint ?? label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardContent() {
  const { data: stats, isPending, isError } = useDashboardStats();

  if (isPending) {
    return (
      <>
        <AdminPageHeader title="Dashboard" description="How the business is doing right now." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72 rounded-xl" />
      </>
    );
  }

  if (isError || !stats) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Couldn&apos;t load dashboard statistics. Please try again.
        </p>
      </>
    );
  }

  const { revenue, counts, revenueByMonth, bookingsByStatus, topSellers, latestBookings } = stats;

  return (
    <>
      <AdminPageHeader title="Dashboard" description="How the business is doing right now." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RevenueCard
          label="Total revenue"
          value={formatCurrency(revenue.total, revenue.currencyCode)}
          emphasis
        />
        <RevenueCard
          label="This month"
          value={formatCurrency(revenue.thisMonth, revenue.currencyCode)}
          changePercent={revenue.changePercent}
        />
        <RevenueCard
          label="Last month"
          value={formatCurrency(revenue.lastMonth, revenue.currencyCode)}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Revenue counts confirmed and completed bookings only.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CountCard
          label="Bookings"
          hint={`${counts.pendingBookings} pending`}
          value={counts.totalBookings}
          icon={CalendarCheck}
          href="/dashboard/bookings"
        />
        <CountCard label="Customers" value={counts.totalCustomers} icon={Users} href="/dashboard/customers" />
        <CountCard
          label="Inquiries"
          hint="new inquiries"
          value={counts.newInquiries}
          icon={Mail}
          href="/dashboard/inquiries"
        />
        <CountCard
          label="Subscribers"
          hint="newsletter subscribers"
          value={counts.newsletterSubscribers}
          icon={Send}
          href="/dashboard/newsletter"
        />
        <CountCard
          label="Hotels"
          hint="published hotels"
          value={counts.publishedHotels}
          icon={BedDouble}
          href="/dashboard/hotels"
        />
        <CountCard
          label="Packages"
          hint="published packages"
          value={counts.publishedPackages}
          icon={Package}
          href="/dashboard/packages"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Revenue, last 12 months</h2>
            <RevenueBarChart data={revenueByMonth} currencyCode={revenue.currencyCode} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Bookings by status</h2>
            <BookingStatusDonut data={bookingsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Latest bookings</h2>
          {latestBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            </div>
          ) : (
            <AdminTable
              head={
                <>
                  <th>Reference</th>
                  <th>Guest</th>
                  <th>Booked</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </>
              }
            >
              {latestBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/40">
                  <td className="font-mono text-xs">{booking.bookingNumber}</td>
                  <td>
                    <p className="font-medium text-foreground">{booking.guestFullName}</p>
                    <p className="text-xs text-muted-foreground">{booking.hotelName ?? "—"}</p>
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td>
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="text-right font-medium whitespace-nowrap">
                    {formatCurrency(booking.totalAmount, booking.currencyCode)}
                  </td>
                </tr>
              ))}
            </AdminTable>
          )}
        </div>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="size-4" /> Top sellers
            </h2>
            {topSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No confirmed sales yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {topSellers.map((seller) => (
                  <li key={`${seller.type}-${seller.name}`} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{seller.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {seller.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {seller.bookings} booking{seller.bookings !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-foreground">
                      {formatCurrency(seller.revenue, revenue.currencyCode)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
