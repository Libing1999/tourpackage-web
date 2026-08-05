import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { PopularSearch, SearchHit, SearchSuggestions, SearchType } from "./types";

export const searchApi = {
  suggest: (q: string) =>
    apiClient
      .get<ApiResponse<SearchSuggestions>>("/public/search/suggest", { params: { q } })
      .then((r) => r.data.data),

  search: (params: { q: string; type?: SearchType; page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<SearchHit>>>("/public/search", { params })
      .then((r) => r.data.data),

  popular: (limit = 8) =>
    apiClient
      .get<ApiResponse<PopularSearch[]>>("/public/search/popular", { params: { limit } })
      .then((r) => r.data.data),
};
