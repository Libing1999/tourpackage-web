"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import type { BookingStatus } from "@/features/booking/types";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageOperations } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAdminBookings, useUpdateBookingStatus } from "../hooks/use-admin";
import { AdminListState, AdminPageHeader, AdminTable } from "./admin-page";
import { StatusSelect } from "./status-select";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function BookingsContent() {
  const { data: admin } = useProfileQuery();
  const canManage = canManageOperations(admin?.role);

  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useAdminBookings({ status, search: search || undefined, page, size: 15 });
  const updateStatus = useUpdateBookingStatus();

  const changeStatus = (id: string, next: BookingStatus) => {
    updateStatus.mutate(
      { id, status: next, cancellationReason: next === "CANCELLED" ? "Cancelled by admin" : undefined },
      {
        onSuccess: () => toast.success(`Booking marked ${LABELS[next].toLowerCase()}`),
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <>
      <AdminPageHeader title="Bookings" description="Confirm, complete, or cancel customer bookings." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by reference, guest name, or email…"
            className="h-9 pl-8"
            aria-label="Search bookings"
          />
        </div>
        <StatusSelect
          value={status}
          options={STATUSES}
          labels={LABELS}
          anyLabel="All statuses"
          ariaLabel="Filter by status"
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
        emptyMessage="No bookings match these filters."
      >
        <AdminTable
          head={
            <>
              <th>Reference</th>
              <th>Guest</th>
              <th>Booked</th>
              <th>Travel dates</th>
              <th>Total</th>
              <th>Status</th>
            </>
          }
        >
          {data?.content.map((booking) => (
            <tr key={booking.id} className="hover:bg-muted/40">
              <td>
                <p className="font-mono text-xs">{booking.bookingNumber}</p>
                <p className="text-xs text-muted-foreground">{booking.bookingType}</p>
              </td>
              <td>
                <p className="font-medium text-foreground">{booking.guestFullName}</p>
                <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
              </td>
              <td className="whitespace-nowrap text-muted-foreground">{formatDate(booking.createdAt)}</td>
              <td className="whitespace-nowrap text-muted-foreground">
                {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
              </td>
              <td className="font-medium whitespace-nowrap">
                {formatCurrency(booking.totalAmount, booking.currencyCode)}
              </td>
              <td>
                {canManage ? (
                  <StatusSelect
                    value={booking.status}
                    options={STATUSES}
                    labels={LABELS}
                    ariaLabel={`Change status for ${booking.bookingNumber}`}
                    className="w-[140px]"
                    disabled={updateStatus.isPending}
                    onChange={(next) => next && next !== booking.status && changeStatus(booking.id, next)}
                  />
                ) : (
                  <BookingStatusBadge status={booking.status} />
                )}
              </td>
            </tr>
          ))}
        </AdminTable>

        {data ? (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            className="mt-5"
          />
        ) : null}
      </AdminListState>
    </>
  );
}
