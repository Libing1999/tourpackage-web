"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";
import { useRecentSearches, useSearchResults } from "../hooks/use-search";
import type { SearchHit, SearchType } from "../types";

const PAGE_SIZE = 12;

const TABS: { value: SearchType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CITY", label: "Destinations" },
  { value: "HOTEL", label: "Hotels" },
  { value: "PACKAGE", label: "Packages" },
  { value: "COUNTRY", label: "Countries" },
];

const TYPE_LABEL: Record<SearchType, string> = {
  HOTEL: "Hotel",
  PACKAGE: "Package",
  CITY: "Destination",
  COUNTRY: "Country",
};

/**
 * Full search results.
 *
 * <p>State lives in the URL rather than in the component: a search result page
 * is something people bookmark, share and reload, and all three need the query,
 * the active tab and the page number to survive.
 */
export function SearchResultsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = params.get("q") ?? "";
  const type = (params.get("type") as SearchType | null) ?? undefined;
  const page = Number(params.get("page") ?? 0);

  const [draft, setDraft] = useState(query);
  const { add } = useRecentSearches();

  // Keep the box in step when the query changes from elsewhere — the navbar,
  // the back button, a shared link.
  useEffect(() => setDraft(query), [query]);

  // A search that arrives by URL is still a search worth remembering.
  useEffect(() => {
    if (query.trim().length >= 2) add(query.trim());
  }, [query, add]);

  const { data, isPending, isError } = useSearchResults({ q: query, type, page, size: PAGE_SIZE });

  const push = (next: { q?: string; type?: SearchType | "ALL"; page?: number }) => {
    const search = new URLSearchParams();
    const q = next.q ?? query;
    if (q) search.set("q", q);

    const nextType = next.type ?? type ?? "ALL";
    if (nextType !== "ALL") search.set("type", nextType);

    // Page resets on any change of query or tab — page 4 of the previous search
    // is meaningless for the new one, and often empty.
    const nextPage = next.page ?? 0;
    if (nextPage > 0) search.set("page", String(nextPage));

    router.push(`${pathname}?${search.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
      </h1>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim().length >= 2) push({ q: draft.trim(), page: 0 });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search hotels, packages, destinations…"
            aria-label="Search"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = (type ?? "ALL") === tab.value;
          return (
            <Button
              key={tab.value}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              onClick={() => push({ type: tab.value, page: 0 })}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-6">
        {query.trim().length < 2 ? (
          <p className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            Type at least two characters to search.
          </p>
        ) : isPending ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
            Something went wrong running that search.
          </p>
        ) : !data || data.content.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-sm text-foreground">
              No results for &ldquo;{query}&rdquo;
              {type ? <> in {TYPE_LABEL[type].toLowerCase()}s</> : null}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try fewer words, or check another category.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {data.totalElements} result{data.totalElements === 1 ? "" : "s"}
            </p>

            <ul className="grid gap-3 sm:grid-cols-2">
              {data.content.map((hit) => (
                <li key={`${hit.type}-${hit.id}`}>
                  <ResultCard hit={hit} />
                </li>
              ))}
            </ul>

            <Pagination
              className="mt-8"
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={(next) => push({ page: next })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ResultCard({ hit }: { hit: SearchHit }) {
  return (
    <Link
      href={hit.url}
      className="flex h-full items-center gap-4 rounded-xl border bg-card p-3 transition-colors hover:border-primary"
    >
      {hit.imageUrl ? (
        // Plain img: these URLs come from the CMS or an upload provider, and
        // next/image only permits hosts listed in next.config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hit.imageUrl}
          alt=""
          loading="lazy"
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Search className="size-5 text-muted-foreground" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">{hit.title}</span>
        {hit.subtitle ? (
          <span className="block truncate text-sm text-muted-foreground">{hit.subtitle}</span>
        ) : null}
      </span>

      <span className="shrink-0 self-start rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
        {TYPE_LABEL[hit.type]}
      </span>
    </Link>
  );
}
