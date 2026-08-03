"use client";

import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/format";
import type { HotelDetail } from "@/features/hotels/types";
import { useCreateHotelBooking } from "../hooks/use-booking";
import { useBookingForms, routeSubmitError } from "../hooks/use-booking-forms";
import { staySchema, type StayFormValues } from "../schemas";
import { BookingStepper } from "./booking-stepper";
import { BookingSummaryCard } from "./booking-summary-card";
import { GuestDetailsStep } from "./steps/guest-details-step";
import { TravellersStep } from "./steps/travellers-step";
import { ReviewPaymentStep } from "./steps/review-payment-step";
import { addDaysIso, todayIso } from "../date-utils";

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return ms > 0 ? Math.round(ms / 86_400_000) : 0;
}

interface BookingFlowProps {
  hotel: HotelDetail;
  initialRoomId?: string;
}

export function BookingFlow({ hotel, initialRoomId }: BookingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createBooking = useCreateHotelBooking();
  const { guestForm, travellersForm, travellerFields, paymentForm, travellersPayload } =
    useBookingForms();

  const bookableRooms = useMemo(() => hotel.rooms.filter((r) => r.isAvailable), [hotel.rooms]);

  const [roomId, setRoomId] = useState(
    () => initialRoomId ?? searchParams.get("roomId") ?? bookableRooms[0]?.id ?? ""
  );
  const [step, setStep] = useState(0);

  const room = hotel.rooms.find((r) => r.id === roomId) ?? bookableRooms[0];

  const stayForm = useForm<StayFormValues>({
    resolver: zodResolver(staySchema),
    defaultValues: {
      checkInDate: searchParams.get("checkIn") ?? addDaysIso(todayIso(), 7),
      checkOutDate: searchParams.get("checkOut") ?? addDaysIso(todayIso(), 10),
      numberOfAdults: 2,
      numberOfChildren: 0,
    },
  });

  const stay = stayForm.watch();
  const nights = nightsBetween(stay.checkInDate, stay.checkOutDate);

  if (!room) {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <p className="font-medium text-foreground">No rooms are available to book at this hotel.</p>
            <Link href={`/hotels/${hotel.slug}`} className="mt-4 inline-block">
              <Button variant="outline">Back to hotel</Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const goNext = async () => {
    const valid =
      step === 0
        ? await stayForm.trigger()
        : step === 1
          ? await guestForm.trigger()
          : step === 2
            ? await travellersForm.trigger()
            : true;

    if (valid) {
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = paymentForm.handleSubmit((paymentValues) => {
    const stayValues = stayForm.getValues();

    createBooking.mutate(
      {
        hotelRoomId: room.id,
        checkInDate: stayValues.checkInDate,
        checkOutDate: stayValues.checkOutDate,
        numberOfAdults: stayValues.numberOfAdults,
        numberOfChildren: stayValues.numberOfChildren,
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
            if (fieldErrors.checkInDate) {
              stayForm.setError("checkInDate", { message: fieldErrors.checkInDate });
            }
            if (fieldErrors.checkOutDate) {
              stayForm.setError("checkOutDate", { message: fieldErrors.checkOutDate });
            }
            return Boolean(fieldErrors.checkInDate || fieldErrors.checkOutDate);
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
            href={`/hotels/${hotel.slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to {hotel.name}
          </Link>

          <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Complete your booking</h1>

          <div className="mb-8">
            <BookingStepper currentStep={step} />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border bg-background p-5 sm:p-6">
              {step === 0 ? (
                <div className="flex flex-col gap-5">
                  <h2 className="font-semibold text-foreground">Select your room and dates</h2>

                  <div className="flex flex-col gap-1.5">
                    <Label>Room</Label>
                    <Select value={roomId} onValueChange={(v) => setRoomId(v as string)}>
                      <SelectTrigger className="w-full" aria-label="Select room">
                        <SelectValue placeholder="Choose a room">
                          {(value: string | null) =>
                            hotel.rooms.find((r) => r.id === value)?.name ?? "Choose a room"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {bookableRooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} — {formatCurrency(r.pricePerNight, r.currencyCode)}/night
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sleeps up to {room.maxAdults} adult{room.maxAdults !== 1 ? "s" : ""}
                      {room.maxChildren > 0
                        ? ` and ${room.maxChildren} child${room.maxChildren !== 1 ? "ren" : ""}`
                        : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkInDate">Check-in</Label>
                      <Input
                        id="checkInDate"
                        type="date"
                        min={todayIso()}
                        aria-invalid={!!stayForm.formState.errors.checkInDate}
                        {...stayForm.register("checkInDate")}
                      />
                      {stayForm.formState.errors.checkInDate ? (
                        <p className="text-sm text-destructive">
                          {stayForm.formState.errors.checkInDate.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkOutDate">Check-out</Label>
                      <Input
                        id="checkOutDate"
                        type="date"
                        min={stay.checkInDate || todayIso()}
                        aria-invalid={!!stayForm.formState.errors.checkOutDate}
                        {...stayForm.register("checkOutDate")}
                      />
                      {stayForm.formState.errors.checkOutDate ? (
                        <p className="text-sm text-destructive">
                          {stayForm.formState.errors.checkOutDate.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="numberOfAdults">Adults</Label>
                      <Input
                        id="numberOfAdults"
                        type="number"
                        min={1}
                        max={room.maxAdults}
                        aria-invalid={!!stayForm.formState.errors.numberOfAdults}
                        {...stayForm.register("numberOfAdults", { valueAsNumber: true })}
                      />
                      {stayForm.formState.errors.numberOfAdults ? (
                        <p className="text-sm text-destructive">
                          {stayForm.formState.errors.numberOfAdults.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="numberOfChildren">Children</Label>
                      <Input
                        id="numberOfChildren"
                        type="number"
                        min={0}
                        max={room.maxChildren}
                        aria-invalid={!!stayForm.formState.errors.numberOfChildren}
                        {...stayForm.register("numberOfChildren", { valueAsNumber: true })}
                      />
                      {stayForm.formState.errors.numberOfChildren ? (
                        <p className="text-sm text-destructive">
                          {stayForm.formState.errors.numberOfChildren.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 1 ? <GuestDetailsStep form={guestForm} /> : null}

              {step === 2 ? (
                <TravellersStep form={travellersForm} fieldArray={travellerFields} />
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
                  <Button type="button" onClick={goNext}>
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
                <BookingSummaryCard
                  hotel={hotel}
                  room={room}
                  checkInDate={stay.checkInDate}
                  checkOutDate={stay.checkOutDate}
                  nights={nights}
                  numberOfAdults={Number(stay.numberOfAdults) || 0}
                  numberOfChildren={Number(stay.numberOfChildren) || 0}
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
