import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api";
import type { Booking, Gender, PaymentMethod } from "./types";

export interface CreateHotelBookingPayload {
  hotelRoomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  travellers: Array<{
    fullName: string;
    dateOfBirth?: string | null;
    gender?: Gender | null;
    passportNumber?: string | null;
    isLeadTraveller: boolean;
  }>;
  specialRequests?: string | null;
  paymentMethod: PaymentMethod;
}

export interface CreatePackageBookingPayload {
  packageId: string;
  travelDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  travellers: Array<{
    fullName: string;
    dateOfBirth?: string | null;
    gender?: Gender | null;
    passportNumber?: string | null;
    isLeadTraveller: boolean;
  }>;
  specialRequests?: string | null;
  paymentMethod: PaymentMethod;
}

export const bookingApi = {
  createHotelBooking: (payload: CreateHotelBookingPayload) =>
    apiClient
      .post<ApiResponse<Booking>>("/public/bookings/hotel", payload)
      .then((res) => res.data.data),

  createPackageBooking: (payload: CreatePackageBookingPayload) =>
    apiClient
      .post<ApiResponse<Booking>>("/public/bookings/package", payload)
      .then((res) => res.data.data),

  lookup: (bookingNumber: string, email: string) =>
    apiClient
      .get<ApiResponse<Booking>>(`/public/bookings/${bookingNumber}`, { params: { email } })
      .then((res) => res.data.data),

  history: (bookingNumber: string, email: string) =>
    apiClient
      .get<ApiResponse<Booking[]>>("/public/bookings/history", { params: { bookingNumber, email } })
      .then((res) => res.data.data),
};
