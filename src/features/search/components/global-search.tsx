"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Search, TrendingUp, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePopularSearches, useRecentSearches, useSuggestions } from "../hooks/use-search";
import type { SearchHit } from "../types";

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  HOTEL: "Hotel",
  PACKAGE: "Package",
  CITY: "Destination",
  COUNTRY: "Country",
};

interface GlobalSearchProps {
  /** Rendered inside the mobile menu, where the dropdown is inline rather than floating. */
  variant?: "navbar" | "inline";
  onNavigate?: () => void;
}

/**
 * Site-wide search box with an autocomplete dropdown.
 *
 * <p>Before anything is typed the panel shows recent and popular searches, so
 * it is useful on focus rather than only after input. Once there are two
 * characters it shows grouped suggestions.
 */
export function GlobalSearch({ variant = "navbar", onNavigate }: GlobalSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const { data: suggestions, isFetching, isTyping, enabled } = useSuggestions(value);
  const { data: popular } = usePopularSearches();
  const { recent, add, remove, clear } = useRecentSearches();

  /**
   * The dropdown renders as groups but arrow keys have to walk it as one list,
   * so the groups are flattened once and both views read from the same array —
   * otherwise the highlighted index and the rendered order can disagree.
   */
  const hits = useMemo<SearchHit[]>(
    () =>
      suggestions
        ? [
            ...suggestions.destinations,
            ...suggestions.hotels,
            ...suggestions.packages,
            ...suggestions.countries,
          ]
        : [],
    [suggestions]
  );

  const showSuggestions = enabled && hits.length > 0;
  const showEmpty = enabled && !isFetching && !isTyping && hits.length === 0;
  const showShortcuts = !enabled && (recent.length > 0 || (popular?.length ?? 0) > 0);

  // Close when focus or a click goes elsewhere. Pointerdown rather than click so
  // the panel closes before a click on the page behind it is processed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // A changed result set invalidates whatever was highlighted.
  useEffect(() => setActiveIndex(-1), [hits]);

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    add(trimmed);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const go = (hit: SearchHit) => {
    // The term, not the title: "bal" is what they searched, and what should
    // come back if they open the box again.
    add(value.trim());
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    onNavigate?.();
    router.push(hit.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && hits[activeIndex]) go(hits[activeIndex]);
      else submit(value);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    e.preventDefault();
    if (!showSuggestions) return;
    setOpen(true);
    // -1 means "nothing highlighted, the input has focus". Both directions wrap,
    // so ArrowUp from the top of the list jumps to the last result.
    setActiveIndex((current) =>
      e.key === "ArrowDown"
        ? current >= hits.length - 1
          ? 0
          : current + 1
        : current <= 0
          ? hits.length - 1
          : current - 1
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", variant === "navbar" ? "w-full max-w-sm" : "w-full")}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          // Deliberately not type="search". Chrome natively clears a search
          // input on Escape, and that clearing fires onChange — which reopened
          // the panel a frame after Escape had just closed it. This component
          // renders its own clear button anyway.
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label="Search hotels, packages and destinations"
          placeholder="Search hotels, packages, destinations…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="pr-9 pl-9"
        />
        {isFetching || isTyping ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {open && (showSuggestions || showEmpty || showShortcuts) ? (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border bg-popover p-2 shadow-lg",
            variant === "navbar" ? "absolute inset-x-0 top-full" : "relative"
          )}
        >
          {showSuggestions
            ? renderGroups(suggestions!, hits, activeIndex, go, setActiveIndex)
            : null}

          {showSuggestions ? (
            <button
              type="button"
              onClick={() => submit(value)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <Search className="size-4" />
              See all results for &ldquo;{value.trim()}&rdquo;
            </button>
          ) : null}

          {showEmpty ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nothing matches &ldquo;{value.trim()}&rdquo;.
            </p>
          ) : null}

          {showShortcuts ? (
            <>
              {recent.length > 0 ? (
                <section className="mb-1">
                  <header className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Recent
                    </span>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </header>
                  {recent.map((term) => (
                    <div key={term} className="group flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setValue(term);
                          submit(term);
                        }}
                        className="flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <Clock className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{term}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${term} from recent searches`}
                        onClick={() => remove(term)}
                        className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </section>
              ) : null}

              {popular && popular.length > 0 ? (
                <section>
                  <header className="px-3 py-1.5">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Popular searches
                    </span>
                  </header>
                  <div className="flex flex-wrap gap-1.5 px-3 pt-1 pb-2">
                    {popular.map((p) => (
                      <Button
                        key={p.term}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue(p.term);
                          submit(p.term);
                        }}
                      >
                        <TrendingUp className="size-3.5" />
                        {p.term}
                      </Button>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function renderGroups(
  suggestions: { hotels: SearchHit[]; packages: SearchHit[]; destinations: SearchHit[]; countries: SearchHit[] },
  flat: SearchHit[],
  activeIndex: number,
  go: (hit: SearchHit) => void,
  setActiveIndex: (i: number) => void
) {
  const groups: [string, SearchHit[]][] = [
    ["Destinations", suggestions.destinations],
    ["Hotels", suggestions.hotels],
    ["Packages", suggestions.packages],
    ["Countries", suggestions.countries],
  ];

  return groups.map(([label, items]) =>
    items.length === 0 ? null : (
      <section key={label} className="mb-1">
        <header className="px-3 py-1.5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        </header>
        {items.map((hit) => {
          const index = flat.indexOf(hit);
          return (
            <button
              key={`${hit.type}-${hit.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => go(hit)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                index === activeIndex ? "bg-accent" : "hover:bg-accent/60"
              )}
            >
              {hit.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hit.imageUrl}
                  alt=""
                  loading="lazy"
                  className="size-9 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Search className="size-4 text-muted-foreground" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{hit.title}</span>
                {hit.subtitle ? (
                  <span className="block truncate text-xs text-muted-foreground">{hit.subtitle}</span>
                ) : null}
              </span>
              <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
                {TYPE_LABEL[hit.type]}
              </span>
            </button>
          );
        })}
      </section>
    )
  );
}
