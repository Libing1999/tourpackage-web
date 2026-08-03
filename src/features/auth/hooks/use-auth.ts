"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { clearTokens, getAccessToken, setTokens } from "@/services/api-client";
import { authApi } from "../api";
import type {
  AdminProfile,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "../types";

export const authKeys = {
  profile: ["auth", "profile"] as const,
};

/**
 * The single source of truth for "who is logged in" — no separate auth
 * store. Login/logout prime or clear this query's cache directly instead
 * of duplicating admin state elsewhere.
 */
export function useProfileQuery() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: authApi.getProfile,
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData<AdminProfile>(authKeys.profile, data.admin);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authApi.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authApi.resetPassword(payload),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => authApi.updateProfile(payload),
    onSuccess: (admin) => {
      queryClient.setQueryData<AdminProfile>(authKeys.profile, admin);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    clearTokens();
    queryClient.removeQueries({ queryKey: authKeys.profile });
    router.replace("/login");
  };
}
