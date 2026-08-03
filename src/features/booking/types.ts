export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type BookingType = "HOTEL" | "PACKAGE";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CASH"
  | "WALLET";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface BookingTraveller {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  isLeadTraveller: boolean;
}

export interface BookingPayment {
  id: string;
  amount: number;
  currencyCode: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
}

/**
 * Mirrors the API's single BookingResponse: `bookingType` says which of the
 * two blocks is populated, and the other's fields come back null. One shape
 * because booking history returns hotel and package bookings interleaved.
 */
export interface Booking {
  id: string;
  bookingNumber: string;
  bookingType: BookingType;
  status: BookingStatus;

  // HOTEL only
  hotelName: string | null;
  hotelSlug: string | null;
  roomName: string | null;
  roomTypeName: string | null;
  pricePerNight: number | null;
  nights: number | null;

  // PACKAGE only
  packageTitle: string | null;
  packageSlug: string | null;
  durationDays: number | null;
  durationNights: number | null;
  pricePerAdult: number | null;
  pricePerChild: number | null;

  // common
  cityName: string;
  countryName: string;
  startDate: string;
  endDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  totalAmount: number;
  currencyCode: string;

  guestFullName: string;
  guestEmail: string;
  guestPhone: string | null;

  specialRequests: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;

  travellers: BookingTraveller[];
  payment: BookingPayment | null;
}
