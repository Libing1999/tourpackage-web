import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingConfirmationContent } from "@/features/booking/components/booking-confirmation-content";
import { Spinner } from "@/components/common/spinner";

export const metadata: Metadata = {
  title: "Booking confirmation",
  robots: { index: false, follow: false },
};

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
