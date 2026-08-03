"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  bookingApi,
  type CreateHotelBookingPayload,
  type CreatePackageBookingPayload,
} from "../api";

export const bookingKeys = {
  lookup: (bookingNumber: string, email: string) => ["booking", bookingNumber, email] as const,
  history: (bookingNumber: string, email: string) =>
    ["booking", "history", bookingNumber, email] as const,
};

export function useCreateHotelBooking() {
  return useMutation({
    mutationFn: (payload: CreateHotelBookingPayload) => bookingApi.createHotelBooking(payload),
  });
}

export function useCreatePackageBooking() {
  return useMutation({
    mutationFn: (payload: CreatePackageBookingPayload) => bookingApi.createPackageBooking(payload),
  });
}

export function useBookingHistory(bookingNumber: string, email: string, enabled: boolean) {
  return useQuery({
    queryKey: bookingKeys.history(bookingNumber, email),
    queryFn: () => bookingApi.history(bookingNumber, email),
    enabled: enabled && Boolean(bookingNumber) && Boolean(email),
    retry: false,
  });
}

export function useBookingLookup(bookingNumber: string, email: string, enabled: boolean) {
  return useQuery({
    queryKey: bookingKeys.lookup(bookingNumber, email),
    queryFn: () => bookingApi.lookup(bookingNumber, email),
    enabled: enabled && Boolean(bookingNumber) && Boolean(email),
    retry: false,
  });
}
