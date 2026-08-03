import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Booking, BookingStatus } from "@/features/booking/types";
import type {
  BookingAdminListItem,
  Customer,
  DashboardStats,
  FaqAdmin,
  FaqPayload,
  HotelAdminListItem,
  InquiryAdminListItem,
  InquiryStatus,
  NewsletterSubscriber,
  PackageAdminListItem,
  Setting,
  TestimonialAdmin,
  TestimonialPayload,
} from "./types";

export interface PageParams {
  page?: number;
  size?: number;
  search?: string;
}

export const adminApi = {
  getDashboardStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats").then((r) => r.data.data),

  // --- bookings ---
  listBookings: (params: PageParams & { status?: BookingStatus }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<BookingAdminListItem>>>("/admin/bookings", { params })
      .then((r) => r.data.data),

  getBooking: (id: string) =>
    apiClient.get<ApiResponse<Booking>>(`/admin/bookings/${id}`).then((r) => r.data.data),

  updateBookingStatus: (id: string, status: BookingStatus, cancellationReason?: string) =>
    apiClient
      .patch<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, { status, cancellationReason })
      .then((r) => r.data.data),

  // --- inquiries ---
  listInquiries: (params: PageParams & { status?: InquiryStatus }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<InquiryAdminListItem>>>("/admin/inquiries", { params })
      .then((r) => r.data.data),

  updateInquiryStatus: (id: string, status: InquiryStatus) =>
    apiClient.patch<ApiResponse<unknown>>(`/admin/inquiries/${id}/status`, { status }).then((r) => r.data),

  // --- customers ---
  listCustomers: (params: PageParams) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Customer>>>("/admin/customers", { params })
      .then((r) => r.data.data),

  // --- newsletter ---
  listSubscribers: (params: PageParams & { active?: boolean }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<NewsletterSubscriber>>>("/admin/newsletter", { params })
      .then((r) => r.data.data),

  unsubscribe: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/newsletter/${id}`).then((r) => r.data),

  // --- testimonials ---
  listTestimonials: () =>
    apiClient.get<ApiResponse<TestimonialAdmin[]>>("/admin/testimonials").then((r) => r.data.data),

  createTestimonial: (payload: TestimonialPayload) =>
    apiClient.post<ApiResponse<TestimonialAdmin>>("/admin/testimonials", payload).then((r) => r.data.data),

  updateTestimonial: (id: string, payload: TestimonialPayload) =>
    apiClient
      .put<ApiResponse<TestimonialAdmin>>(`/admin/testimonials/${id}`, payload)
      .then((r) => r.data.data),

  deleteTestimonial: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/testimonials/${id}`).then((r) => r.data),

  // --- faqs ---
  listFaqs: () => apiClient.get<ApiResponse<FaqAdmin[]>>("/admin/faqs").then((r) => r.data.data),

  createFaq: (payload: FaqPayload) =>
    apiClient.post<ApiResponse<FaqAdmin>>("/admin/faqs", payload).then((r) => r.data.data),

  updateFaq: (id: string, payload: FaqPayload) =>
    apiClient.put<ApiResponse<FaqAdmin>>(`/admin/faqs/${id}`, payload).then((r) => r.data.data),

  deleteFaq: (id: string) => apiClient.delete<ApiResponse<null>>(`/admin/faqs/${id}`).then((r) => r.data),

  // --- settings ---
  listSettings: () => apiClient.get<ApiResponse<Setting[]>>("/admin/settings").then((r) => r.data.data),

  updateSettings: (values: Record<string, string>) =>
    apiClient.put<ApiResponse<Setting[]>>("/admin/settings", { values }).then((r) => r.data.data),

  // --- catalogue (read + delete; full create/edit forms live in the public-facing
  // modules' own admin endpoints and aren't surfaced in this UI yet) ---
  listHotels: (params: PageParams & { status?: string }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<HotelAdminListItem>>>("/admin/hotels", { params })
      .then((r) => r.data.data),

  deleteHotel: (id: string) => apiClient.delete<ApiResponse<null>>(`/admin/hotels/${id}`).then((r) => r.data),

  listPackages: (params: PageParams & { status?: string }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<PackageAdminListItem>>>("/admin/tour-packages", { params })
      .then((r) => r.data.data),

  deletePackage: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/admin/tour-packages/${id}`).then((r) => r.data),
};
