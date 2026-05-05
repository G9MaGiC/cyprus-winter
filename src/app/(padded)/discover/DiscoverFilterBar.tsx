"use client";

import { Link } from "@/i18n/navigation";
import FilterChips from "@/components/FilterChips";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";

type DiscoverFilterBarProps = {
  sections: DiscoverSection[];
  filterParam: string;
  filter: string | undefined;
  sectionExists: boolean;
  totalCount: number;
  activeSectionTitle: string;
  hasWineriesInView: boolean;
  onScrollToMap: () => void;
};

export default function DiscoverFilterBar({
  sections,
  filterParam,
  filter,
  sectionExists,
  totalCount,
  activeSectionTitle,
  hasWineriesInView,
  onScrollToMap,
}: DiscoverFilterBarProps) {
  const chips = [
    { id: "", label: "All" },
    { id: "nature", label: "Nature & coasts" },
    { id: "family", label: "Family-friendly" },
    ...sections.filter((s) => s.id !== "coasts").map((s) => ({ id: s.id, label: s.title })),
  ];

  return (
    <div
      className={`sticky ${LAYOUT.stickyTop} z-20 bg-background/98 backdrop-blur-md border-b border-sand-200/60 ${LAYOUT.stickyBarX} py-4 sm:py-5`}
    >
      <div className={`${LAYOUT.list} mx-auto space-y-3`}>
        <div role="group" aria-labelledby="discover-filter-label" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-1">
            <span
              className="prose-label text-olive/60 uppercase tracking-wider"
              id="discover-filter-label"
            >
              {filter && sectionExists
                ? `${activeSectionTitle} · ${totalCount} places`
                : "Filter places"}
            </span>
            {filter && sectionExists && (
              <Link href="/discover" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
                Clear filter
              </Link>
            )}
          </div>

          <FilterChips
            chips={chips}
            isActive={(chip) => {
              if (chip.id === "") return !filter;
              if (chip.id === "nature")
                return filter === "coasts" || filterParam === "nature";
              if (chip.id === "family") return filterParam === "family";
              if (chip.id === "hidden")
                return filter === "hidden" && filterParam !== "family";
              return filter === chip.id;
            }}
            getHref={(chip) => {
              if (chip.id === "") return "/discover";
              if (
                chip.id === "hidden" &&
                filter === "hidden" &&
                filterParam === "family"
              ) {
                return "/discover?filter=hidden";
              }
              if (chip.id === "family" && filterParam === "family")
                return "/discover";
              if (filter === chip.id) return "/discover";
              return `/discover?filter=${chip.id}`;
            }}
            ariaLabel="Filter places"
          />

          {filterParam && !sectionExists && (
            <p className="text-sm text-olive/70 break-words" role="alert">
              That filter doesn&apos;t exist—showing all places.{" "}
              <Link href="/discover" className={SECTION.aegeanLink}>
                All categories
              </Link>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/plan" className={CTA.primaryCompact}>
            Plan your trip
          </Link>
          {hasWineriesInView && (
            <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
              Book tastings
            </Link>
          )}
          <button
            type="button"
            onClick={onScrollToMap}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-olive/70 hover:bg-sand-200/80 hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Scroll to map of places"
          >
            <svg className="w-4 h-4 shrink-0 text-olive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View on map
          </button>
        </div>
      </div>
    </div>
  );
}
