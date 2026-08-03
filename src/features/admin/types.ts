import type { BookingStatus, BookingType } from "@/features/booking/types";

export interface DashboardStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    /** Null when last month was zero — no honest percentage from nothing. */
    changePercent: number | null;
    currencyCode: string;
  };
  counts: {
    totalBookings: number;
    pendingBookings: number;
    totalCustomers: number;
    newInquiries: number;
    publishedHotels: number;
    publishedPackages: number;
    newsletterSubscribers: number;
  };
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  bookingsByStatus: Array<{ status: BookingStatus; count: number }>;
  topSellers: Array<{ name: string; type: "HOTEL" | "PACKAGE"; bookings: number; revenue: number }>;
  latestBookings: BookingAdminListItem[];
}

export interface BookingAdminListItem {
  id: string;
  bookingNumber: string;
  bookingType: BookingType;
  status: BookingStatus;
  hotelName: string | null;
  roomName: string | null;
  guestFullName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currencyCode: string;
  createdAt: string;
}

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface InquiryAdminListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  travelDate: string | null;
  partySize: number | null;
  message: string;
  status: InquiryStatus;
  packageTitle: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bookingCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export interface TestimonialAdmin {
  id: string;
  customerName: string;
  customerAvatarUrl: string | null;
  customerCountryId: string | null;
  customerCountryName: string | null;
  packageId: string | null;
  packageTitle: string | null;
  rating: number;
  message: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface TestimonialPayload {
  customerName: string;
  customerAvatarUrl?: string | null;
  customerCountryId?: string | null;
  packageId?: string | null;
  rating: number;
  message: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface FaqAdmin {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface FaqPayload {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  valueType: string;
  groupName: string;
  isPublic: boolean;
}

export interface HotelAdminListItem {
  id: string;
  name: string;
  slug: string;
  cityName: string;
  countryName: string;
  coverImageUrl: string | null;
  starRating: number | null;
  basePrice: number;
  currencyCode: string;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface PackageAdminListItem {
  id: string;
  title: string;
  slug: string;
  cityName: string;
  countryName: string;
  coverImageUrl: string | null;
  durationDays: number;
  durationNights: number;
  price: number;
  discountPrice: number | null;
  currencyCode: string;
  difficultyLevel: string;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}
