"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BookingStatus } from "@/features/booking/types";
import { adminApi, type PageParams } from "../api";
import type { FaqPayload, InquiryStatus, TestimonialPayload } from "../types";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  bookings: (p: unknown) => ["admin", "bookings", p] as const,
  inquiries: (p: unknown) => ["admin", "inquiries", p] as const,
  customers: (p: unknown) => ["admin", "customers", p] as const,
  subscribers: (p: unknown) => ["admin", "subscribers", p] as const,
  testimonials: ["admin", "testimonials"] as const,
  faqs: ["admin", "faqs"] as const,
  settings: ["admin", "settings"] as const,
  hotels: (p: unknown) => ["admin", "hotels", p] as const,
  packages: (p: unknown) => ["admin", "packages", p] as const,
};

const LIST_OPTIONS = { staleTime: 30_000, placeholderData: keepPreviousData } as const;

export function useDashboardStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: adminApi.getDashboardStats, staleTime: 60_000 });
}

export function useAdminBookings(params: PageParams & { status?: BookingStatus }) {
  return useQuery({
    queryKey: adminKeys.bookings(params),
    queryFn: () => adminApi.listBookings(params),
    ...LIST_OPTIONS,
  });
}

export function useAdminInquiries(params: PageParams & { status?: InquiryStatus }) {
  return useQuery({
    queryKey: adminKeys.inquiries(params),
    queryFn: () => adminApi.listInquiries(params),
    ...LIST_OPTIONS,
  });
}

export function useAdminCustomers(params: PageParams) {
  return useQuery({
    queryKey: adminKeys.customers(params),
    queryFn: () => adminApi.listCustomers(params),
    ...LIST_OPTIONS,
  });
}

export function useAdminSubscribers(params: PageParams & { active?: boolean }) {
  return useQuery({
    queryKey: adminKeys.subscribers(params),
    queryFn: () => adminApi.listSubscribers(params),
    ...LIST_OPTIONS,
  });
}

export function useAdminTestimonials() {
  return useQuery({ queryKey: adminKeys.testimonials, queryFn: adminApi.listTestimonials });
}

export function useAdminFaqs() {
  return useQuery({ queryKey: adminKeys.faqs, queryFn: adminApi.listFaqs });
}

export function useAdminSettings() {
  return useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.listSettings });
}

export function useAdminHotels(params: PageParams & { status?: string }) {
  return useQuery({
    queryKey: adminKeys.hotels(params),
    queryFn: () => adminApi.listHotels(params),
    ...LIST_OPTIONS,
  });
}

export function useAdminPackages(params: PageParams & { status?: string }) {
  return useQuery({
    queryKey: adminKeys.packages(params),
    queryFn: () => adminApi.listPackages(params),
    ...LIST_OPTIONS,
  });
}

/**
 * Mutations invalidate by prefix rather than by exact key: a list query's key
 * carries its filters and page, so an exact-key invalidation would refresh the
 * page the user happens to be on and leave every other cached page stale.
 */
function useAdminMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  invalidate: readonly unknown[][]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}

export function useUpdateBookingStatus() {
  return useAdminMutation(
    ({ id, status, cancellationReason }: { id: string; status: BookingStatus; cancellationReason?: string }) =>
      adminApi.updateBookingStatus(id, status, cancellationReason),
    [["admin", "bookings"], ["admin", "stats"]]
  );
}

export function useUpdateInquiryStatus() {
  return useAdminMutation(
    ({ id, status }: { id: string; status: InquiryStatus }) => adminApi.updateInquiryStatus(id, status),
    [["admin", "inquiries"], ["admin", "stats"]]
  );
}

export function useUnsubscribe() {
  return useAdminMutation((id: string) => adminApi.unsubscribe(id), [
    ["admin", "subscribers"],
    ["admin", "stats"],
  ]);
}

export function useSaveTestimonial() {
  return useAdminMutation(
    ({ id, payload }: { id?: string; payload: TestimonialPayload }) =>
      id ? adminApi.updateTestimonial(id, payload) : adminApi.createTestimonial(payload),
    [["admin", "testimonials"]]
  );
}

export function useDeleteTestimonial() {
  return useAdminMutation((id: string) => adminApi.deleteTestimonial(id), [["admin", "testimonials"]]);
}

export function useSaveFaq() {
  return useAdminMutation(
    ({ id, payload }: { id?: string; payload: FaqPayload }) =>
      id ? adminApi.updateFaq(id, payload) : adminApi.createFaq(payload),
    [["admin", "faqs"]]
  );
}

export function useDeleteFaq() {
  return useAdminMutation((id: string) => adminApi.deleteFaq(id), [["admin", "faqs"]]);
}

export function useUpdateSettings() {
  return useAdminMutation((values: Record<string, string>) => adminApi.updateSettings(values), [
    ["admin", "settings"],
  ]);
}

export function useDeleteHotel() {
  return useAdminMutation((id: string) => adminApi.deleteHotel(id), [
    ["admin", "hotels"],
    ["admin", "stats"],
  ]);
}

export function useDeletePackage() {
  return useAdminMutation((id: string) => adminApi.deletePackage(id), [
    ["admin", "packages"],
    ["admin", "stats"],
  ]);
}
