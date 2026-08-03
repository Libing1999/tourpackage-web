import { apiClient } from "@/services/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { env } from "@/utils/env";
import type {
  BlogPostAdmin,
  BlogPostDetail,
  BlogPostSummary,
  CmsBanner,
  ContentBlock,
  GalleryImage,
  NavLink,
  PageSeo,
  SiteContent,
} from "./types";

/**
 * Server-side fetches. Navigation, section copy, and SEO all have to be in the
 * initial HTML — a navbar that pops in after hydration is worse than one that
 * was never dynamic, and metadata injected client-side is invisible to crawlers.
 * So these bypass the axios client (which is browser-only, carrying tokens from
 * localStorage) and use plain `fetch` with Next's cache.
 */
const SITE_CONTENT_REVALIDATE = 60;

export async function fetchSiteContent(): Promise<SiteContent | null> {
  try {
    const res = await fetch(`${env.apiUrl}/public/cms/site-content`, {
      next: { revalidate: SITE_CONTENT_REVALIDATE },
    });
    if (!res.ok) return null;
    const body: ApiResponse<SiteContent> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchPageSeo(path: string): Promise<PageSeo | null> {
  try {
    const res = await fetch(
      `${env.apiUrl}/public/cms/seo?path=${encodeURIComponent(path)}`,
      { next: { revalidate: SITE_CONTENT_REVALIDATE } }
    );
    if (!res.ok) return null;
    const body: ApiResponse<PageSeo | null> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchGallery(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`${env.apiUrl}/public/cms/gallery`, {
      next: { revalidate: SITE_CONTENT_REVALIDATE },
    });
    if (!res.ok) return [];
    const body: ApiResponse<GalleryImage[]> = await res.json();
    return body.data;
  } catch {
    return [];
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(`${env.apiUrl}/public/cms/blog/${slug}`, {
      next: { revalidate: SITE_CONTENT_REVALIDATE },
    });
    if (!res.ok) return null;
    const body: ApiResponse<BlogPostDetail> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

/** Client-side reads (paginated blog listing). */
export const cmsApi = {
  listPosts: (params: { page?: number; size?: number; category?: string }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<BlogPostSummary>>>("/public/cms/blog", { params })
      .then((r) => r.data.data),

  // --- admin ---
  listBlocks: () => apiClient.get<ApiResponse<ContentBlock[]>>("/admin/cms/blocks").then((r) => r.data.data),
  saveBlock: (id: string | undefined, payload: Omit<ContentBlock, "id">) =>
    (id
      ? apiClient.put<ApiResponse<ContentBlock>>(`/admin/cms/blocks/${id}`, payload)
      : apiClient.post<ApiResponse<ContentBlock>>("/admin/cms/blocks", payload)
    ).then((r) => r.data.data),
  deleteBlock: (id: string) => apiClient.delete(`/admin/cms/blocks/${id}`).then((r) => r.data),

  listNavLinks: () => apiClient.get<ApiResponse<NavLink[]>>("/admin/cms/nav-links").then((r) => r.data.data),
  saveNavLink: (id: string | undefined, payload: Omit<NavLink, "id">) =>
    (id
      ? apiClient.put<ApiResponse<NavLink>>(`/admin/cms/nav-links/${id}`, payload)
      : apiClient.post<ApiResponse<NavLink>>("/admin/cms/nav-links", payload)
    ).then((r) => r.data.data),
  deleteNavLink: (id: string) => apiClient.delete(`/admin/cms/nav-links/${id}`).then((r) => r.data),

  listSeo: () => apiClient.get<ApiResponse<PageSeo[]>>("/admin/cms/seo").then((r) => r.data.data),
  saveSeo: (id: string | undefined, payload: Omit<PageSeo, "id">) =>
    (id
      ? apiClient.put<ApiResponse<PageSeo>>(`/admin/cms/seo/${id}`, payload)
      : apiClient.post<ApiResponse<PageSeo>>("/admin/cms/seo", payload)
    ).then((r) => r.data.data),
  deleteSeo: (id: string) => apiClient.delete(`/admin/cms/seo/${id}`).then((r) => r.data),

  listGallery: () =>
    apiClient.get<ApiResponse<GalleryImage[]>>("/admin/cms/gallery").then((r) => r.data.data),
  saveGalleryImage: (id: string | undefined, payload: Omit<GalleryImage, "id">) =>
    (id
      ? apiClient.put<ApiResponse<GalleryImage>>(`/admin/cms/gallery/${id}`, payload)
      : apiClient.post<ApiResponse<GalleryImage>>("/admin/cms/gallery", payload)
    ).then((r) => r.data.data),
  deleteGalleryImage: (id: string) => apiClient.delete(`/admin/cms/gallery/${id}`).then((r) => r.data),

  listBanners: () => apiClient.get<ApiResponse<CmsBanner[]>>("/admin/cms/banners").then((r) => r.data.data),
  saveBanner: (id: string | undefined, payload: Omit<CmsBanner, "id">) =>
    (id
      ? apiClient.put<ApiResponse<CmsBanner>>(`/admin/cms/banners/${id}`, payload)
      : apiClient.post<ApiResponse<CmsBanner>>("/admin/cms/banners", payload)
    ).then((r) => r.data.data),
  deleteBanner: (id: string) => apiClient.delete(`/admin/cms/banners/${id}`).then((r) => r.data),

  listAdminPosts: () =>
    apiClient.get<ApiResponse<BlogPostAdmin[]>>("/admin/cms/blog").then((r) => r.data.data),
  savePost: (id: string | undefined, payload: Record<string, unknown>) =>
    (id
      ? apiClient.put<ApiResponse<BlogPostAdmin>>(`/admin/cms/blog/${id}`, payload)
      : apiClient.post<ApiResponse<BlogPostAdmin>>("/admin/cms/blog", payload)
    ).then((r) => r.data.data),
  deletePost: (id: string) => apiClient.delete(`/admin/cms/blog/${id}`).then((r) => r.data),
};
