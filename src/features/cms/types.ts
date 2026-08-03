export interface ContentBlock {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  isActive: boolean;
}

export type NavGroup = "HEADER" | "FOOTER";

export interface NavLink {
  id: string;
  navGroup: NavGroup;
  label: string;
  href: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SiteContent {
  blocks: Record<string, ContentBlock>;
  header: NavLink[];
  footer: NavLink[];
}

export interface PageSeo {
  id: string;
  path: string;
  metaTitle: string;
  metaDescription: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export type BannerPlacement = "HOME_SLIDER" | "OFFERS_STRIP" | "PAGE_HERO";

export interface CmsBanner {
  id: string;
  placement: BannerPlacement;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonLabel: string | null;
  displayOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string;
  publishedAt: string;
  readTimeMinutes: number | null;
  authorName: string | null;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  category: string;
  publishedAt: string;
  readTimeMinutes: number | null;
  authorName: string | null;
}

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPostAdmin extends BlogPostDetail {
  status: ContentStatus;
  createdAt: string;
}
