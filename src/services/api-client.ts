import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/utils/env";
import { storage } from "@/utils/storage";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse } from "@/features/auth/types";

export const ACCESS_TOKEN_KEY = "tourpackage_access_token";
export const REFRESH_TOKEN_KEY = "tourpackage_refresh_token";

export function getAccessToken(): string | null {
  return storage.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storage.get(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  storage.set(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  // File uploads send FormData, and the instance-wide JSON default above would
  // otherwise be attached to them — the request goes out labelled
  // application/json with a multipart body, and Spring rejects it before the
  // controller is reached. Dropping the header lets the browser set
  // multipart/form-data itself, which is the only way the boundary gets filled in.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

// Endpoints that legitimately return 401 as part of their normal flow (bad
// credentials, an already-invalid refresh token) — never attempt a
// token-refresh retry loop against these.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh"];

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function notifyWaiters(token: string | null) {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  // A bare axios call, not apiClient: going through apiClient here would
  // re-enter this same response interceptor on failure.
  const response = await axios.post<ApiResponse<AuthResponse>>(
    `${env.apiUrl}/auth/refresh`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  setTokens(accessToken, newRefreshToken);
  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (!getRefreshToken()) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaiters.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.set("Authorization", `Bearer ${token}`);
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await refreshAccessToken();
      isRefreshing = false;
      notifyWaiters(newAccessToken);

      if (!newAccessToken) {
        clearTokens();
        return Promise.reject(error);
      }

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      notifyWaiters(null);
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);
