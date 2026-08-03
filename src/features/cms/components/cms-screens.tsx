"use client";

import { Badge } from "@/components/ui/badge";
import { cmsApi } from "../api";
import type {
  BlogPostAdmin,
  CmsBanner,
  ContentBlock,
  GalleryImage,
  NavLink,
  PageSeo,
} from "../types";
import { GalleryReorder } from "@/features/media/components/gallery-reorder";
import { useQuery } from "@tanstack/react-query";
import { CmsResourceManager } from "./cms-resource-manager";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={
        active
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      }
    >
      {active ? "Active" : "Hidden"}
    </Badge>
  );
}

/** Homepage slider, offers strip, and page hero images. */
export function BannersScreen() {
  return (
    <CmsResourceManager<CmsBanner>
      title="Homepage Slider"
      description="Hero images and promotional banners. Scheduling is optional — leave the dates empty to show a banner immediately and indefinitely."
      noun="banner"
      queryKey={["cms", "banners"]}
      list={cmsApi.listBanners}
      save={cmsApi.saveBanner}
      remove={cmsApi.deleteBanner}
      describe={(b) => b.title ?? b.imageUrl}
      emptyRow={{
        placement: "HOME_SLIDER",
        title: "",
        subtitle: "",
        imageUrl: "",
        linkUrl: "",
        buttonLabel: "",
        displayOrder: 0,
        isActive: true,
        startsAt: null,
        endsAt: null,
      }}
      fields={[
        {
          name: "placement",
          label: "Placement",
          type: "select",
          half: true,
          options: [
            { value: "HOME_SLIDER", label: "Homepage slider" },
            { value: "OFFERS_STRIP", label: "Offers strip" },
            { value: "PAGE_HERO", label: "Page hero" },
          ],
        },
        { name: "displayOrder", label: "Display order", type: "number", half: true },
        { name: "title", label: "Title" },
        { name: "subtitle", label: "Subtitle" },
        { name: "imageUrl", label: "Image", type: "image" },
        { name: "linkUrl", label: "Link URL", half: true, placeholder: "/packages" },
        { name: "buttonLabel", label: "Button label", half: true },
        { name: "isActive", label: "Active", type: "checkbox", half: true },
      ]}
      columns={[
        {
          header: "Image",
          render: (b) => (
            <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted">
              {/* Editor-supplied URLs can point anywhere, so this uses a plain
                  img rather than next/image, which only allows configured hosts. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt="" className="size-full object-cover" />
            </div>
          ),
        },
        {
          header: "Banner",
          render: (b) => (
            <>
              <p className="font-medium text-foreground">{b.title ?? "—"}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{b.subtitle}</p>
            </>
          ),
        },
        { header: "Placement", render: (b) => <Badge variant="outline">{b.placement}</Badge> },
        { header: "Order", render: (b) => b.displayOrder, className: "text-right" },
        { header: "Status", render: (b) => <ActiveBadge active={b.isActive} /> },
      ]}
    />
  );
}

/** Section headings and page copy. */
export function ContentBlocksScreen() {
  return (
    <CmsResourceManager<ContentBlock>
      title="Site Content"
      description="Headings and intro copy used across the site. Each block is addressed by its key — the page reads it by that name."
      noun="block"
      queryKey={["cms", "blocks"]}
      list={cmsApi.listBlocks}
      save={cmsApi.saveBlock}
      remove={cmsApi.deleteBlock}
      describe={(b) => b.key}
      emptyRow={{
        key: "",
        eyebrow: "",
        title: "",
        subtitle: "",
        body: "",
        isActive: true,
      }}
      fields={[
        { name: "key", label: "Key", half: true, placeholder: "home.hotels" },
        { name: "isActive", label: "Active", type: "checkbox", half: true },
        { name: "eyebrow", label: "Eyebrow", half: true },
        { name: "title", label: "Title", half: true },
        { name: "subtitle", label: "Subtitle", type: "textarea", rows: 2 },
        { name: "body", label: "Body", type: "textarea" },
      ]}
      columns={[
        {
          header: "Key",
          render: (b) => <code className="font-mono text-xs">{b.key}</code>,
        },
        {
          header: "Content",
          render: (b) => (
            <>
              {b.eyebrow ? <p className="text-xs text-primary uppercase">{b.eyebrow}</p> : null}
              <p className="font-medium text-foreground">{b.title ?? "—"}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{b.subtitle}</p>
            </>
          ),
        },
        { header: "Status", render: (b) => <ActiveBadge active={b.isActive} /> },
      ]}
    />
  );
}

/** Navbar and footer links. */
export function NavLinksScreen() {
  return (
    <CmsResourceManager<NavLink>
      title="Navigation"
      description="Links in the site header and footer."
      noun="link"
      queryKey={["cms", "nav-links"]}
      list={cmsApi.listNavLinks}
      save={cmsApi.saveNavLink}
      remove={cmsApi.deleteNavLink}
      describe={(l) => l.label}
      emptyRow={{
        navGroup: "HEADER",
        label: "",
        href: "",
        displayOrder: 0,
        isActive: true,
      }}
      fields={[
        {
          name: "navGroup",
          label: "Location",
          type: "select",
          half: true,
          options: [
            { value: "HEADER", label: "Header" },
            { value: "FOOTER", label: "Footer" },
          ],
        },
        { name: "displayOrder", label: "Display order", type: "number", half: true },
        { name: "label", label: "Label", half: true },
        { name: "href", label: "Link", half: true, placeholder: "/hotels" },
        { name: "isActive", label: "Active", type: "checkbox", half: true },
      ]}
      columns={[
        { header: "Label", render: (l) => <span className="font-medium text-foreground">{l.label}</span> },
        { header: "Link", render: (l) => <code className="font-mono text-xs">{l.href}</code> },
        { header: "Location", render: (l) => <Badge variant="outline">{l.navGroup}</Badge> },
        { header: "Order", render: (l) => l.displayOrder, className: "text-right" },
        { header: "Status", render: (l) => <ActiveBadge active={l.isActive} /> },
      ]}
    />
  );
}

/** Per-route metadata. */
export function SeoScreen() {
  return (
    <CmsResourceManager<PageSeo>
      title="SEO"
      description="Page titles and descriptions used in search results and social previews. Detail pages (a hotel, a post) derive their own metadata and aren't listed here."
      noun="page"
      queryKey={["cms", "seo"]}
      list={cmsApi.listSeo}
      save={cmsApi.saveSeo}
      remove={cmsApi.deleteSeo}
      describe={(s) => s.path}
      emptyRow={{
        path: "",
        metaTitle: "",
        metaDescription: "",
        ogImageUrl: "",
        noIndex: false,
      }}
      fields={[
        { name: "path", label: "Path", half: true, placeholder: "/hotels" },
        { name: "noIndex", label: "Hide from search engines", type: "checkbox", half: true },
        { name: "metaTitle", label: "Meta title" },
        { name: "metaDescription", label: "Meta description", type: "textarea", rows: 3 },
        { name: "ogImageUrl", label: "Social share image", type: "image" },
      ]}
      columns={[
        { header: "Path", render: (s) => <code className="font-mono text-xs">{s.path}</code> },
        {
          header: "Metadata",
          render: (s) => (
            <>
              <p className="font-medium text-foreground">{s.metaTitle}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{s.metaDescription}</p>
            </>
          ),
        },
        {
          header: "Indexing",
          render: (s) =>
            s.noIndex ? (
              <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                No-index
              </Badge>
            ) : (
              <Badge variant="outline">Indexed</Badge>
            ),
        },
      ]}
    />
  );
}

/** Gallery photographs, with a reorder strip above the table. */
export function GalleryScreen() {
  // Shares the resource manager's query key, so uploading, deleting or
  // reordering keeps both views in step without a second fetch.
  const { data: images } = useQuery({ queryKey: ["cms", "gallery"], queryFn: cmsApi.listGallery });

  return (
    <CmsResourceManager<GalleryImage>
      afterHeader={images ? <GalleryReorder images={images} /> : null}
      title="Gallery"
      description="Photographs shown on the public gallery page. Categories become the page's filter buttons."
      noun="photo"
      queryKey={["cms", "gallery"]}
      list={cmsApi.listGallery}
      save={cmsApi.saveGalleryImage}
      remove={cmsApi.deleteGalleryImage}
      describe={(g) => g.caption ?? g.url}
      emptyRow={{
        url: "",
        altText: "",
        caption: "",
        category: "General",
        displayOrder: 0,
        isActive: true,
      }}
      fields={[
        { name: "url", label: "Image", type: "image" },
        { name: "caption", label: "Caption", half: true },
        { name: "category", label: "Category", half: true, placeholder: "Cities" },
        { name: "altText", label: "Alt text (for screen readers)" },
        { name: "displayOrder", label: "Display order", type: "number", half: true },
        { name: "isActive", label: "Active", type: "checkbox", half: true },
      ]}
      columns={[
        {
          header: "Photo",
          render: (g) => (
            <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="size-full object-cover" />
            </div>
          ),
        },
        {
          header: "Caption",
          render: (g) => (
            <>
              <p className="font-medium text-foreground">{g.caption ?? "—"}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{g.altText}</p>
            </>
          ),
        },
        { header: "Category", render: (g) => <Badge variant="outline">{g.category}</Badge> },
        { header: "Order", render: (g) => g.displayOrder, className: "text-right" },
        { header: "Status", render: (g) => <ActiveBadge active={g.isActive} /> },
      ]}
    />
  );
}

/** Blog posts. */
export function BlogScreen() {
  return (
    <CmsResourceManager<BlogPostAdmin>
      title="Blog"
      description="Articles on the public blog. Only published posts are visible; publishing stamps the date automatically."
      noun="post"
      queryKey={["cms", "admin-blog"]}
      list={cmsApi.listAdminPosts}
      save={(id, payload) => cmsApi.savePost(id, payload as Record<string, unknown>)}
      remove={cmsApi.deletePost}
      describe={(p) => p.title}
      emptyRow={{
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImageUrl: "",
        category: "General",
        status: "DRAFT",
        publishedAt: "",
        readTimeMinutes: null,
        authorName: null,
        createdAt: "",
      }}
      fields={[
        { name: "title", label: "Title", half: true },
        { name: "slug", label: "Slug", half: true, placeholder: "my-post-title" },
        {
          name: "status",
          label: "Status",
          type: "select",
          half: true,
          options: [
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ],
        },
        { name: "category", label: "Category", half: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2 },
        { name: "content", label: "Content", type: "textarea", rows: 8 },
        { name: "coverImageUrl", label: "Cover image", type: "image" },
        { name: "readTimeMinutes", label: "Read time (minutes)", type: "number", half: true },
      ]}
      columns={[
        {
          header: "Post",
          render: (p) => (
            <>
              <p className="font-medium text-foreground">{p.title}</p>
              <code className="font-mono text-xs text-muted-foreground">{p.slug}</code>
            </>
          ),
        },
        { header: "Category", render: (p) => <Badge variant="outline">{p.category}</Badge> },
        { header: "Author", render: (p) => p.authorName ?? "—" },
        {
          header: "Status",
          render: (p) => (
            <Badge
              className={
                p.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground"
              }
            >
              {p.status}
            </Badge>
          ),
        },
      ]}
    />
  );
}
