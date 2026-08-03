import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  Banner,
  BlogPostSummary,
  Destination,
  Faq,
  HotelSummary,
  PublicSettings,
  Testimonial,
  TourPackageSummary,
} from "./types";

export const homeApi = {
  getBanners: () => apiClient.get<ApiResponse<Banner[]>>("/public/banners").then((res) => res.data.data),

  getPopularDestinations: (limit = 8) =>
    apiClient
      .get<ApiResponse<Destination[]>>("/public/destinations/popular", { params: { limit } })
      .then((res) => res.data.data),

  getTopHotels: (limit = 8) =>
    apiClient
      .get<ApiResponse<HotelSummary[]>>("/public/hotels/top", { params: { limit } })
      .then((res) => res.data.data),

  getBestPackages: (limit = 8) =>
    apiClient
      .get<ApiResponse<TourPackageSummary[]>>("/public/tour-packages/best", { params: { limit } })
      .then((res) => res.data.data),

  getSpecialOffers: (limit = 6) =>
    apiClient
      .get<ApiResponse<TourPackageSummary[]>>("/public/tour-packages/offers", { params: { limit } })
      .then((res) => res.data.data),

  getFeaturedTestimonials: (limit = 6) =>
    apiClient
      .get<ApiResponse<Testimonial[]>>("/public/testimonials/featured", { params: { limit } })
      .then((res) => res.data.data),

  getRecentBlogPosts: (limit = 6) =>
    apiClient
      .get<ApiResponse<BlogPostSummary[]>>("/public/blog-posts/recent", { params: { limit } })
      .then((res) => res.data.data),

  getFaqs: () => apiClient.get<ApiResponse<Faq[]>>("/public/faqs").then((res) => res.data.data),

  getPublicSettings: () =>
    apiClient.get<ApiResponse<PublicSettings>>("/public/settings").then((res) => res.data.data),

  subscribeNewsletter: (email: string) =>
    apiClient.post<ApiResponse<null>>("/public/newsletter/subscribe", { email }).then((res) => res.data),
};
