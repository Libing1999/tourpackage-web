import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  AdminProfile,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "./types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", payload).then((res) => res.data.data),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<null>>("/auth/forgot-password", payload).then((res) => res.data),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<null>>("/auth/reset-password", payload).then((res) => res.data),

  getProfile: () => apiClient.get<ApiResponse<AdminProfile>>("/auth/profile").then((res) => res.data.data),

  updateProfile: (payload: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<AdminProfile>>("/auth/profile", payload).then((res) => res.data.data),
};
