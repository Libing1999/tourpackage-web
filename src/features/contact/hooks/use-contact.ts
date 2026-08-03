"use client";

import { useMutation } from "@tanstack/react-query";

import { contactApi, type CreateInquiryPayload } from "../api";

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (payload: CreateInquiryPayload) => contactApi.createInquiry(payload),
  });
}
