import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  folder: string;
  createdAt: string;
}

export const mediaApi = {
  list: (params: { folder?: string; page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<MediaAsset>>>("/admin/media", { params })
      .then((r) => r.data.data),

  /**
   * Uploads several files in one multipart request.
   *
   * <p>No Content-Type is set here: the request interceptor strips the client's
   * JSON default for FormData bodies so the browser can set
   * multipart/form-data with its own boundary.
   */
  upload: (files: File[], folder: string) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));

    return apiClient
      .post<ApiResponse<MediaAsset[]>>(`/admin/media?folder=${encodeURIComponent(folder)}`, form)
      .then((r) => r.data.data);
  },

  remove: (id: string) => apiClient.delete<ApiResponse<null>>(`/admin/media/${id}`).then((r) => r.data),

  reorderGallery: (ids: string[]) =>
    apiClient.patch<ApiResponse<unknown>>("/admin/cms/gallery/reorder", { ids }).then((r) => r.data),
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
