"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TourPackageDetail } from "@/features/packages/types";
import { useCreatePackageBooking } from "../hooks/use-booking";
import { useBookingForms, routeSubmitError } from "../hooks/use-booking-forms";
import { packageTripSchema, type PackageTripFormValues } from "../schemas";
import { BookingStepper, PACKAGE_BOOKING_STEPS } from "./booking-stepper";
import { PackageSummaryCard } from "./package-summary-card";
import { GuestDetailsStep } from "./steps/guest-details-step";
import { TravellersStep } from "./steps/travellers-step";
import { ReviewPaymentStep } from "./steps/review-payment-step";
import { addDaysIso, todayIso } from "../date-utils";

export function PackageBookingFlow({ pkg }: { pkg: TourPackageDetail }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createBooking = useCreatePackageBooking();
  const { guestForm, travellersForm, travellerFields, paymentForm, travellersPayload } =
    useBookingForms();

  const [step, setStep] = useState(0);

  const tripForm = useForm<PackageTripFormValues>({
    resolver: zodResolver(packageTripSchema),
    defaultValues: {
      travelDate: searchParams.get("date") ?? addDaysIso(todayIso(), 21),
      numberOfAdults: Math.max(1, pkg.minGroupSize),
      numberOfChildren: 0,
    },
  });

  const trip = tripForm.watch();
  const adults = Number(trip.numberOfAdults) || 0;
  const children = Number(trip.numberOfChildren) || 0;
  const partySize = adults + children;

  const goNext = async () => {
    const valid =
      step === 0
        ? await tripForm.trigger()
        : step === 1
          ? await guestForm.trigger()
          : step === 2
            ? await travellersForm.trigger()
            : true;

    if (valid) {
      // The API requires one traveller row per person in the party. Rather
      // than making the guest add them by hand and then rejecting a mismatch
      // at submit, the traveller list is resized to match as they arrive.
      if (step === 1) {
        syncTravellerRows();
      }
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const syncTravellerRows = () => {
    const current = travellerFields.fields.length;
    if (partySize > current) {
      for (let i = current; i < partySize; i++) {
        travellerFields.append({ fullName: "", dateOfBirth: "", gender: "", passportNumber: "" });
      }
    } else if (partySize < current) {
      for (let i = current - 1; i >= partySize; i--) {
        travellerFields.remove(i);
      }
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = paymentForm.handleSubmit((paymentValues) => {
    const tripValues = tripForm.getValues();

    createBooking.mutate(
      {
        packageId: pkg.id,
        travelDate: tripValues.travelDate,
        numberOfAdults: tripValues.numberOfAdults,
        numberOfChildren: tripValues.numberOfChildren,
        guest: guestForm.getValues(),
        travellers: travellersPayload(),
        specialRequests: paymentValues.specialRequests || null,
        paymentMethod: paymentValues.paymentMethod,
      },
      {
        onSuccess: (booking) => {
          router.push(
            `/bookings/confirmation?number=${booking.bookingNumber}&email=${encodeURIComponent(booking.guestEmail)}`
          );
        },
        onError: (error) => {
          const jumpTo = routeSubmitError(error, guestForm, (fieldErrors) => {
            if (fieldErrors.travelDate) {
              tripForm.setError("travelDate", { message: fieldErrors.travelDate });
              return true;
            }
            return false;
          });
          if (jumpTo !== null) setStep(jumpTo);
        },
      }
    );
  });

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/packages/${pkg.slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to {pkg.title}
          </Link>

          <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            Book this package
          </h1>

          <div className="mb-8">
            <BookingStepper currentStep={step} steps={PACKAGE_BOOKING_STEPS} />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border bg-background p-5 sm:p-6">
              {step === 0 ? (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="font-semibold text-foreground">Choose your date and party</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This is a {pkg.durationDays}-day trip — your return date is set automatically.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="travelDate">Departure date</Label>
                    <Input
                      id="travelDate"
                      type="date"
                      min={todayIso()}
                      aria-invalid={!!tripForm.formState.errors.travelDate}
                      {...tripForm.register("travelDate")}
                    />
                    {tripForm.formState.errors.travelDate ? (
                      <p className="text-sm text-destructive">
                        {tripForm.formState.errors.travelDate.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="numberOfAdults">Adults</Label>
                      <Input
                        id="numberOfAdults"
                        type="number"
                        min={1}
                        aria-invalid={!!tripForm.formState.errors.numberOfAdults}
                        {...tripForm.register("numberOfAdults", { valueAsNumber: true })}
                      />
                      {tripForm.formState.errors.numberOfAdults ? (
                        <p className="text-sm text-destructive">
                          {tripForm.formState.errors.numberOfAdults.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="numberOfChildren">Children</Label>
                      <Input
                        id="numberOfChildren"
                        type="number"
                        min={0}
                        aria-invalid={!!tripForm.formState.errors.numberOfChildren}
                        {...tripForm.register("numberOfChildren", { valueAsNumber: true })}
                      />
                      {tripForm.formState.errors.numberOfChildren ? (
                        <p className="text-sm text-destructive">
                          {tripForm.formState.errors.numberOfChildren.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Children travel at a reduced rate. This package takes{" "}
                    {pkg.maxGroupSize
                      ? `${pkg.minGroupSize}–${pkg.maxGroupSize} travellers`
                      : `${pkg.minGroupSize} traveller${pkg.minGroupSize !== 1 ? "s" : ""} or more`}
                    .
                  </p>

                  {pkg.maxGroupSize && partySize > pkg.maxGroupSize ? (
                    <p className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
                      This package takes at most {pkg.maxGroupSize} travellers.
                    </p>
                  ) : null}
                  {partySize < pkg.minGroupSize ? (
                    <p className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
                      This package requires at least {pkg.minGroupSize} travellers.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 1 ? <GuestDetailsStep form={guestForm} /> : null}

              {step === 2 ? (
                <TravellersStep
                  form={travellersForm}
                  fieldArray={travellerFields}
                  requiredCount={partySize}
                />
              ) : null}

              {step === 3 ? (
                <ReviewPaymentStep
                  guestForm={guestForm}
                  travellersForm={travellersForm}
                  paymentForm={paymentForm}
                  onSubmit={submit}
                  isPending={createBooking.isPending}
                />
              ) : null}

              {step < 3 ? (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={
                      step === 0 &&
                      (partySize < pkg.minGroupSize ||
                        (pkg.maxGroupSize !== null && partySize > pkg.maxGroupSize))
                    }
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                </div>
              )}
            </div>

            <aside>
              <div className="lg:sticky lg:top-24">
                <PackageSummaryCard
                  pkg={pkg}
                  travelDate={trip.travelDate}
                  numberOfAdults={adults}
                  numberOfChildren={children}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
