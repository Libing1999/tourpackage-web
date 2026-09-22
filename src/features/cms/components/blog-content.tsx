"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Pagination } from "@/components/common/pagination";
import { Reveal } from "@/components/common/reveal";
import { CardGridSkeleton } from "@/features/home/components/card-grid-skeleton";
import { BlogCard } from "@/features/home/components/blog-card";
import { cmsApi } from "../api";
import { useBlock } from "../site-content-provider";

const PAGE_SIZE = 9;

export function BlogContent() {
  const heading = useBlock("home.blog");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useQuery({
    queryKey: ["cms", "blog", page],
    queryFn: () => cmsApi.listPosts({ page, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/[0.06] to-transparent">
          <div className="mx-auto max-w-3xl animate-rise px-4 py-16 text-center sm:px-6 lg:px-8">
            {heading?.eyebrow ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/[0.07] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase ring-1 ring-primary/10">
                {heading.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {heading?.title}
            </h1>
            {heading?.subtitle ? (
              <p className="mt-4 text-muted-foreground">{heading.subtitle}</p>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {isError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Couldn&apos;t load posts. Please try again.
            </p>
          ) : isPending ? (
            <CardGridSkeleton
              count={6}
              cardClassName="aspect-auto h-80"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            />
          ) : data && data.content.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.content.map((post, i) => (
                  <Reveal key={post.id} delayMs={Math.min(i, 6) * 60}>
                    <Link href={`/blog/${post.slug}`} className="block">
                      <BlogCard post={post} />
                    </Link>
                  </Reveal>
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
                className="mt-10"
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center">
              <p className="text-sm text-muted-foreground">No posts have been published yet.</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
