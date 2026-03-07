"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { search, type SearchResult } from "@/lib/search";

type SearchBarProps = {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  initialQuery?: string;
  /** When true, syncs query to URL /search?q= for shareability */
  syncUrl?: boolean;
};

export default function SearchBar({
  placeholder = "Find a place or trail",
  autoFocus = false,
  className = "",
  initialQuery = "",
  syncUrl = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() =>
    query.length >= 2 ? search(query, 12) : [],
  [query]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!syncUrl) return;
    const t = setTimeout(() => {
      const q = query.trim();
      if (q.length >= 2) {
        router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
      } else if (q.length === 0) {
        router.replace("/search", { scroll: false });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, syncUrl, router]);

  const showDropdown = focused && results.length > 0;
  const hasResults = results.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      window.location.href = results[activeIndex].href;
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const typeLabel = (r: SearchResult) => {
    if (r.kind === "place") {
      const t = r.item.type;
      if (t === "trail") return "Trail";
      if (t === "winery") return "Winery";
      return "Place";
    }
    if (r.kind === "trail") return "Trail";
    return "Event";
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={placeholder}
          aria-label="Search places, trails, and events"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          id="search-input"
          className="w-full min-h-[44px] pl-11 pr-4 py-3 rounded-lg border border-sand-200/70 bg-sand-100/50 text-olive placeholder:text-olive/60 focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20"
        />
      </div>

      {showDropdown && (
        <div
          id="search-results"
          ref={listRef}
          role="listbox"
          aria-labelledby="search-input"
          className="absolute top-full left-0 right-0 mt-2 py-2 rounded-lg bg-sand-100/95 border border-sand-200/70 max-h-96 overflow-y-auto z-50"
        >
          {results.map((r, i) => (
            <div
              key={`${r.kind}-${r.item.id}`}
              role="option"
              data-index={i}
              aria-selected={i === activeIndex}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 min-h-[44px] hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta/30 ${
                i === activeIndex ? "bg-terracotta/10" : ""
              }`}
            >
              <Link
                href={r.href}
                className="flex-1 min-w-0"
                tabIndex={-1}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-olive truncate">{r.item.name}</span>
                  <span className="text-xs text-olive/60 shrink-0">{typeLabel(r)}</span>
                </div>
                <span className="text-sm text-olive/70 truncate block">{r.item.region}</span>
              </Link>
              <Link
                href={`/plan?add=${encodeURIComponent(r.item.id)}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-sm font-medium text-terracotta hover:text-terracotta-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta/30 rounded px-2 py-1 -mx-2 -my-1"
              >
                Add to plan
              </Link>
            </div>
          ))}
        </div>
      )}

      {focused && query.length > 0 && query.length < 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-3 px-4 rounded-lg bg-sand-100/95 border border-sand-200/70 z-50 text-olive/60 text-sm">
          Type at least 2 characters
        </div>
      )}
      {query.length >= 2 && !hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 py-6 px-4 rounded-lg bg-sand-100/95 border border-sand-200/70 z-50 text-center text-olive/70 text-sm">
          <p className="mb-4">Nothing for &ldquo;{query}&rdquo;. Try Troodos, Nissi, Omodos, or browse Discover.</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive/60 mb-2">Or explore</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/discover"
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            >
              Browse Discover
            </Link>
            <Link
              href="/trails"
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            >
              View all trails
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium border border-sand-200/80 text-olive/80 hover:border-terracotta/30 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            >
              Plan your trip
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
