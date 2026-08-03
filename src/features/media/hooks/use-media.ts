"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mediaApi } from "../api";

export const mediaKeys = {
  list: (params: unknown) => ["media", "list", params] as const,
};

export function useMediaList(params: { folder?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder: string }) =>
      mediaApi.upload(files, folder),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
  });
}

export function useReorderGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => mediaApi.reorderGallery(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms", "gallery"] }),
  });
}
