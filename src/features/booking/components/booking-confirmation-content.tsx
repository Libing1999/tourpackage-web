"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingLookup } from "../hooks/use-booking";
import { BookingDetails } from "./booking-details";

export function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get("number") ?? "";
  const email = searchParams.get("email") ?? "";

  const { data: booking, isPending, isError } = useBookingLookup(bookingNumber, email, true);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {isPending ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : isError || !booking ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <p className="font-medium text-foreground">We couldn&apos;t find that booking.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check the reference and email address, then try again.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center text-center">
                <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-500" />
                <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                  Booking received
                </h1>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  Thanks, {booking.guestFullName.split(" ")[0]}. We&apos;ve emailed your confirmation
                  to <span className="text-foreground">{booking.guestEmail}</span>. Your booking is
                  pending review — we&apos;ll be in touch shortly.
                </p>
              </div>

              <BookingDetails booking={booking} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
