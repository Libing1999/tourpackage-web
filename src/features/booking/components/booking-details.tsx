import Link from "next/link";
import { CalendarDays, Mail, MapPin, Phone, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/utils/format";
import { BookingStatusBadge } from "./booking-status-badge";
import type { Booking } from "../types";

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  PAYPAL: "PayPal",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Pay at hotel",
  WALLET: "Wallet",
};

export function BookingDetails({ booking }: { booking: Booking }) {
  const isPackage = booking.bookingType === "PACKAGE";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-background p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Booking reference</p>
            <p className="font-mono text-lg font-semibold text-foreground">{booking.bookingNumber}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {booking.status === "CANCELLED" && booking.cancellationReason ? (
          <p className="mt-3 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
            {booking.cancellationReason}
          </p>
        ) : null}

        <Separator className="my-5" />

        <h2 className="font-semibold text-foreground">
          {isPackage ? booking.packageTitle : booking.hotelName}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {booking.cityName}, {booking.countryName}
        </p>
        {isPackage ? (
          <p className="mt-3 text-sm text-foreground">
            {booking.durationDays} days / {booking.durationNights} nights
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-foreground">{booking.roomName}</p>
            {booking.roomTypeName ? (
              <p className="text-xs text-muted-foreground">{booking.roomTypeName}</p>
            ) : null}
          </>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> {isPackage ? "Departs" : "Check-in"}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{formatDate(booking.startDate)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> {isPackage ? "Returns" : "Check-out"}
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{formatDate(booking.endDate)}</dd>
          </div>
          {!isPackage ? (
            <div>
              <dt className="text-xs text-muted-foreground">Nights</dt>
              <dd className="mt-0.5 text-sm text-foreground">{booking.nights}</dd>
            </div>
          ) : null}
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" /> Travellers
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">
              {booking.numberOfAdults} adult{booking.numberOfAdults !== 1 ? "s" : ""}
              {booking.numberOfChildren > 0
                ? `, ${booking.numberOfChildren} child${booking.numberOfChildren !== 1 ? "ren" : ""}`
                : ""}
            </dd>
          </div>
        </dl>

        <Separator className="my-5" />

        <div className="flex items-start justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {isPackage ? (
              <>
                <p>
                  {formatCurrency(booking.pricePerAdult ?? 0, booking.currencyCode)} ×{" "}
                  {booking.numberOfAdults} adult{booking.numberOfAdults !== 1 ? "s" : ""}
                </p>
                {booking.numberOfChildren > 0 ? (
                  <p>
                    {formatCurrency(booking.pricePerChild ?? 0, booking.currencyCode)} ×{" "}
                    {booking.numberOfChildren} child{booking.numberOfChildren !== 1 ? "ren" : ""}
                  </p>
                ) : null}
              </>
            ) : (
              <p>
                {formatCurrency(booking.pricePerNight ?? 0, booking.currencyCode)} × {booking.nights}{" "}
                night{booking.nights !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <span className="shrink-0 text-lg font-bold text-foreground">
            {formatCurrency(booking.totalAmount, booking.currencyCode)}
          </span>
        </div>
        {booking.payment ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {PAYMENT_LABELS[booking.payment.paymentMethod] ?? booking.payment.paymentMethod} ·{" "}
            payment {booking.payment.status.toLowerCase()}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-background p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-foreground">Guest</h2>
        <p className="text-sm text-foreground">{booking.guestFullName}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-3.5" /> {booking.guestEmail}
        </p>
        {booking.guestPhone ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="size-3.5" /> {booking.guestPhone}
          </p>
        ) : null}

        <Separator className="my-5" />

        <h2 className="mb-3 font-semibold text-foreground">
          Traveller{booking.travellers.length !== 1 ? "s" : ""}
        </h2>
        <ul className="flex flex-col gap-2">
          {booking.travellers.map((t) => (
            <li key={t.id} className="text-sm text-foreground">
              {t.fullName}
              {t.isLeadTraveller ? (
                <span className="ml-2 text-xs text-muted-foreground">(lead traveller)</span>
              ) : null}
            </li>
          ))}
        </ul>

        {booking.specialRequests ? (
          <>
            <Separator className="my-5" />
            <h2 className="mb-2 font-semibold text-foreground">Special requests</h2>
            <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {isPackage ? (
          <>
            <Link href={`/packages/${booking.packageSlug}`}>
              <Button variant="outline">View package</Button>
            </Link>
            <Link href="/packages">
              <Button variant="ghost">Browse more packages</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href={`/hotels/${booking.hotelSlug}`}>
              <Button variant="outline">View hotel</Button>
            </Link>
            <Link href="/hotels">
              <Button variant="ghost">Browse more hotels</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
