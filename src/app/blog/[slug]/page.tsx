import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, UserRound } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { buildMetadata, notFoundMetadata } from "@/features/seo/metadata";
import { JsonLd, blogPostingSchema, breadcrumbSchema } from "@/features/seo/structured-data";
import { fetchSeoSettings } from "@/features/seo/api";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchBlogPost } from "@/features/cms/api";
import { formatDate } from "@/utils/format";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return notFoundMetadata("Post");
  }

  // A post's metadata comes from the post itself rather than a page_seo row —
  // there's one row per route there, and posts are unbounded.
  return buildMetadata({
    title: post.title,
    description: post.excerpt ?? post.content,
    path: `/blog/${post.slug}`,
    imageUrl: post.coverImageUrl,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const settings = await fetchSeoSettings();

  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd
        data={[
          blogPostingSchema(
            {
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              coverImageUrl: post.coverImageUrl,
              publishedAt: post.publishedAt,
              authorName: post.authorName,
            },
            settings
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <SiteNavbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All posts
          </Link>

          <Badge variant="outline">{post.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.publishedAt)}</span>
            {post.authorName ? (
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                {post.authorName}
              </span>
            ) : null}
            {post.readTimeMinutes ? (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readTimeMinutes} min read
              </span>
            ) : null}
          </div>

          {post.coverImageUrl ? (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {post.excerpt ? (
            <p className="mt-8 text-lg leading-relaxed text-foreground">{post.excerpt}</p>
          ) : null}

          {/* Content is stored as plain text, so newlines are preserved rather
              than rendered as HTML — nothing here trusts author markup. */}
          <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {post.content}
          </div>

          <div className="mt-12">
            <Link href="/blog">
              <Button variant="outline">Read more posts</Button>
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
