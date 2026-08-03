"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { homeApi } from "../api";

// Public marketing content changes rarely — a longer staleTime avoids
// re-fetching every section on every homepage visit within the window.
const STALE_TIME_MS = 5 * 60 * 1000;

export const homeKeys = {
  banners: ["home", "banners"] as const,
  destinations: (limit: number) => ["home", "destinations", limit] as const,
  hotels: (limit: number) => ["home", "hotels", limit] as const,
  bestPackages: (limit: number) => ["home", "packages", "best", limit] as const,
  offers: (limit: number) => ["home", "packages", "offers", limit] as const,
  testimonials: (limit: number) => ["home", "testimonials", limit] as const,
  blogPosts: (limit: number) => ["home", "blog-posts", limit] as const,
  faqs: ["home", "faqs"] as const,
  settings: ["home", "settings"] as const,
};

export function useBanners() {
  return useQuery({
    queryKey: homeKeys.banners,
    queryFn: homeApi.getBanners,
    staleTime: STALE_TIME_MS,
  });
}

export function usePopularDestinations(limit = 8) {
  return useQuery({
    queryKey: homeKeys.destinations(limit),
    queryFn: () => homeApi.getPopularDestinations(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useTopHotels(limit = 8) {
  return useQuery({
    queryKey: homeKeys.hotels(limit),
    queryFn: () => homeApi.getTopHotels(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useBestPackages(limit = 8) {
  return useQuery({
    queryKey: homeKeys.bestPackages(limit),
    queryFn: () => homeApi.getBestPackages(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useSpecialOffers(limit = 6) {
  return useQuery({
    queryKey: homeKeys.offers(limit),
    queryFn: () => homeApi.getSpecialOffers(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useFeaturedTestimonials(limit = 6) {
  return useQuery({
    queryKey: homeKeys.testimonials(limit),
    queryFn: () => homeApi.getFeaturedTestimonials(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useRecentBlogPosts(limit = 6) {
  return useQuery({
    queryKey: homeKeys.blogPosts(limit),
    queryFn: () => homeApi.getRecentBlogPosts(limit),
    staleTime: STALE_TIME_MS,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: homeKeys.faqs,
    queryFn: homeApi.getFaqs,
    staleTime: STALE_TIME_MS,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: homeKeys.settings,
    queryFn: homeApi.getPublicSettings,
    staleTime: STALE_TIME_MS,
  });
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (email: string) => homeApi.subscribeNewsletter(email),
  });
}
