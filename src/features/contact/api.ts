import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api";

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone?: string | null;
  travelDate?: string | null;
  partySize?: number | null;
  message: string;
  packageId?: string | null;
}

export const contactApi = {
  createInquiry: (payload: CreateInquiryPayload) =>
    apiClient.post<ApiResponse<null>>("/public/inquiries", payload).then((res) => res.data),
};
