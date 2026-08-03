"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/common/spinner";
import { useBlock } from "@/features/cms/site-content-provider";
import { Separator } from "@/components/ui/separator";
import { useBookingHistory, useBookingLookup } from "../hooks/use-booking";
import { bookingLookupSchema, type BookingLookupFormValues } from "../schemas";
import { BookingDetails } from "./booking-details";
import { BookingHistoryList } from "./booking-history-list";

export function BookingLookupContent() {
  const heading = useBlock("page.bookings");
  const [query, setQuery] = useState<BookingLookupFormValues | null>(null);

  const form = useForm<BookingLookupFormValues>({
    resolver: zodResolver(bookingLookupSchema),
    defaultValues: { bookingNumber: "", email: "" },
  });

  const { data: booking, isFetching, isError } = useBookingLookup(
    query?.bookingNumber ?? "",
    query?.email ?? "",
    query !== null
  );

  // Only fetched once a reference has been verified — the API requires proof
  // of one booking before it will list the rest for that email.
  const { data: history } = useBookingHistory(
    query?.bookingNumber ?? "",
    query?.email ?? "",
    Boolean(booking)
  );

  const otherBookings = (history ?? []).filter((b) => b.bookingNumber !== booking?.bookingNumber);

  const onSubmit = form.handleSubmit((values) => setQuery(values));

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{heading?.title}</h1>
          {heading?.subtitle ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{heading.subtitle}</p>
          ) : null}

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-6 flex flex-col gap-4 rounded-2xl border bg-background p-5 sm:p-6"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bookingNumber">Booking reference</Label>
              <Input
                id="bookingNumber"
                placeholder="TP-2026-000001"
                aria-invalid={!!form.formState.errors.bookingNumber}
                {...form.register("bookingNumber")}
              />
              {form.formState.errors.bookingNumber ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.bookingNumber.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lookup-email">Email</Label>
              <Input
                id="lookup-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="self-start" disabled={isFetching}>
              {isFetching ? <Spinner /> : <Search />}
              Find booking
            </Button>
          </form>

          {query && isError ? (
            <div className="mt-6 rounded-2xl border border-dashed p-10 text-center">
              <p className="font-medium text-foreground">No booking matched those details.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Double-check the reference and email address from your confirmation.
              </p>
            </div>
          ) : null}

          {booking ? (
            <div className="mt-8">
              <BookingDetails booking={booking} />

              {otherBookings.length > 0 ? (
                <div className="mt-10">
                  <Separator className="mb-6" />
                  <h2 className="mb-1 text-lg font-semibold text-foreground">Your other bookings</h2>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Everything else booked with {booking.guestEmail}.
                  </p>
                  <BookingHistoryList bookings={otherBookings} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
