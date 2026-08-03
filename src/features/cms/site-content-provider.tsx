"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ContentBlock, SiteContent } from "./types";

const SiteContentContext = createContext<SiteContent | null>(null);

/**
 * Site content is fetched once in the root layout (a server component) and
 * handed down through context rather than re-fetched per component.
 *
 * <p>Navigation and section headings are in the first HTML response this way,
 * so they don't pop in after hydration — a navbar that appears late reads as
 * broken in a way a hardcoded one never did. It also means one request per
 * page instead of one per section.
 */
export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteContent | null;
  children: ReactNode;
}) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent | null {
  return useContext(SiteContentContext);
}

/**
 * A single content block by key. Returns null when the CMS has no row for it
 * (or is unreachable) — callers skip rendering that heading rather than
 * falling back to a hardcoded string, which would quietly reintroduce the
 * duplication this whole layer exists to remove.
 */
export function useBlock(key: string): ContentBlock | null {
  return useSiteContent()?.blocks[key] ?? null;
}
