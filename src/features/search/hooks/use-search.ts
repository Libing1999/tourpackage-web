"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { storage } from "@/utils/storage";
import { searchApi } from "../api";
import type { SearchType } from "../types";

const RECENT_KEY = "tourpackage.recent-searches";
const MAX_RECENT = 6;

/** Long enough that a typist doesn't fire a request per keystroke, short enough
 * that the dropdown still feels immediate. */
const DEBOUNCE_MS = 250;

/** Mirrors the API's own minimum — below this it returns nothing anyway. */
const MIN_QUERY_LENGTH = 2;

/**
 * Delays a fast-changing value.
 *
 * <p>The cleanup cancels the pending timer on every change, so only the final
 * value in a burst of typing survives to be returned.
 */
export function useDebounced<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Autocomplete for a raw (undebounced) input value.
 *
 * <p>Debouncing happens here rather than in the component so every caller gets
 * it. The query key is the debounced term, which means TanStack Query caches
 * per-term and re-typing a term already searched shows instantly from cache —
 * the second half of not hammering the endpoint.
 */
export function useSuggestions(rawQuery: string) {
  const query = useDebounced(rawQuery.trim());
  const enabled = query.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: ["search", "suggest", query],
    queryFn: () => searchApi.suggest(query),
    enabled,
    staleTime: 60_000,
  });

  return {
    ...result,
    /** The term the current results belong to — the input may already be ahead of it. */
    query,
    enabled,
    /** True while the user has typed something the debounce hasn't caught up to. */
    isTyping: enabled && rawQuery.trim() !== query,
  };
}

export function useSearchResults(params: { q: string; type?: SearchType; page: number; size: number }) {
  return useQuery({
    queryKey: ["search", "results", params],
    queryFn: () => searchApi.search(params),
    enabled: params.q.trim().length >= MIN_QUERY_LENGTH,
    placeholderData: (previous) => previous,
  });
}

export function usePopularSearches(limit = 8) {
  return useQuery({
    queryKey: ["search", "popular", limit],
    queryFn: () => searchApi.popular(limit),
    // Popularity moves slowly, and this renders the moment the box is focused.
    staleTime: 5 * 60_000,
  });
}

/**
 * Recent searches, kept in localStorage.
 *
 * <p>Deliberately not on the server: the site has no visitor accounts, so there
 * is nobody to attach a history to, and "what I personally searched" is exactly
 * the kind of thing that should stay on the device that searched it.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  // Read after mount, never during render — localStorage doesn't exist on the
  // server, and seeding state from it directly would mismatch the SSR markup.
  useEffect(() => {
    setRecent(read());
  }, []);

  const add = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    setRecent((current) => {
      // Case-insensitive de-dupe, so re-searching a term moves it to the top
      // rather than adding a near-duplicate row.
      const withoutDuplicate = current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((term: string) => {
    setRecent((current) => {
      const next = current.filter((t) => t !== term);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, add, remove, clear };
}

function read(): string[] {
  try {
    const raw = storage.get(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    // Anything could be in localStorage — another tab, an older version of this
    // code, a user with devtools open. Validate rather than trust.
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function write(terms: string[]): void {
  try {
    storage.set(RECENT_KEY, JSON.stringify(terms));
  } catch {
    // Private browsing and full quotas both throw here. Losing search history
    // is not worth breaking the search box over.
  }
}
