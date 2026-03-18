"use client";

import AppLink from "@/components/AppLink";
import FilterChips from "@/components/FilterChips";
import StickyFilterBar from "@/components/StickyFilterBar";
import { SECTION, CTA, LAYOUT } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";
import { useTranslations } from "next-intl";

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
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover");
  const chips = [
    { id: "", label: tDiscover("page.filters.all") },
    { id: "nature", label: tDiscover("page.filters.natureAndCoasts") },
    ...sections.filter((s) => s.id !== "coasts").map((s) => ({ id: s.id, label: s.title })),
  ];

  return (
    <StickyFilterBar ariaLabel={tCommon("filterPlaces")}>
      <div className={`${LAYOUT.list} mx-auto space-y-3`}>
        <div role="group" aria-labelledby="discover-filter-label" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-1">
            <span
              className="prose-label text-olive/60 uppercase tracking-wider"
              id="discover-filter-label"
            >
              {filter && sectionExists
                ? `${activeSectionTitle} · ${totalCount} places`
                : tCommon("filterPlaces")}
            </span>
            {filter && sectionExists && (
              <AppLink href="/discover" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
                {tCommon("clearFilter")}
              </AppLink>
            )}
          </div>

          <FilterChips
            chips={chips}
            isActive={(chip) => {
              if (chip.id === "") return !filter;
              if (chip.id === "nature")
                return filter === "coasts" || filterParam === "nature";
              return filter === chip.id;
            }}
            getHref={(chip) =>
              chip.id === "" || filter === chip.id
                ? "/discover"
                : `/discover?filter=${chip.id}`
            }
            ariaLabel={tCommon("filterPlaces")}
          />

          {filterParam && !sectionExists && (
            <p className="text-sm text-olive/70 break-words" role="alert">
              {tDiscover("page.filters.invalid")}{" "}
              <AppLink href="/discover" className={SECTION.aegeanLink}>
                {tCommon("allCategories")}
              </AppLink>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AppLink href="/plan" className={CTA.primaryCompact}>
            {tCommon("planYourTrip")}
          </AppLink>
          {hasWineriesInView && (
            <AppLink href="/bookings" className={CTA.secondaryCompact}>
              {tCommon("bookTastings")}
            </AppLink>
          )}
          <button
            type="button"
            onClick={onScrollToMap}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-olive/70 hover:bg-sand-200/80 hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tDiscover("aria.scrollToMap")}
          >
            <svg className="w-4 h-4 shrink-0 text-olive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {tCommon("viewOnMap")}
          </button>
        </div>
      </div>
    </StickyFilterBar>
  );
}
