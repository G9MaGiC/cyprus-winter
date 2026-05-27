"use client";

import { useState } from "react";
import AppLink from "@/components/AppLink";
import FilterChips from "@/components/FilterChips";
import StickyFilterBar from "@/components/StickyFilterBar";
import { SECTION, CTA, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";
import { ACTIVITY_FILTER_KEYS } from "@/lib/activity-catalog";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { useTranslations } from "next-intl";

type DiscoverFilterBarProps = {
  sections: DiscoverSection[];
  filterParam: string;
  filter: string | undefined;
  sectionExists: boolean;
  totalCount: number;
  activeSectionTitle: string;
  hasWineriesInView: boolean;
  isActivityFilter: boolean;
  onScrollToMap: () => void;
};

function discoverFilterHref(chipId: string, isActive: boolean): string {
  if (chipId === "" || isActive) return "/discover";
  return `/discover?filter=${chipId}`;
}

export default function DiscoverFilterBar({
  sections,
  filterParam,
  filter,
  sectionExists,
  totalCount,
  activeSectionTitle,
  hasWineriesInView,
  isActivityFilter,
  onScrollToMap,
}: DiscoverFilterBarProps) {
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover");
  const { stickyPlanVisible } = useStickyPlanBar();
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const placeChips = [
    { id: "", label: tDiscover("page.filters.all") },
    { id: "nature", label: tDiscover("page.filters.natureAndCoasts") },
    ...sections
      .filter((s) => s.id !== "coasts")
      .map((s) => ({
        id: s.id,
        label: tDiscover(`page.sections.${s.id}`),
      })),
  ];

  const activityChips = ACTIVITY_FILTER_KEYS.map((id) => ({
    id,
    label: tDiscover(`page.filters.${id}`),
  }));

  const isPlaceChipActive = (chip: { id: string }) => {
    if (chip.id === "") return !filterParam;
    if (chip.id === "nature")
      return filter === "coasts" || filterParam === "nature";
    return filter === chip.id && !isActivityFilter;
  };

  const activeFilterLabel =
    filterParam && sectionExists
      ? activeSectionTitle
      : filterParam && !sectionExists
        ? tDiscover("page.filters.invalid")
        : tDiscover("page.filters.toggleAll");

  const filterGroups = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className={`${TYPE.kicker} text-sage`}>
          {tDiscover("page.filterGroups.places")}
        </p>
        <FilterChips
          chips={placeChips}
          isActive={isPlaceChipActive}
          getHref={(chip) => discoverFilterHref(chip.id, isPlaceChipActive(chip))}
          ariaLabel={tDiscover("page.filterGroups.placesAria")}
        />
      </div>

      <div className="space-y-2 pt-1 border-t border-sand-200/80">
        <p className={`${TYPE.kicker} text-sage`}>
          {tDiscover("page.filterGroups.winterMoods")}
        </p>
        <FilterChips
          chips={activityChips}
          isActive={(chip) => filterParam === chip.id}
          getHref={(chip) =>
            discoverFilterHref(chip.id, filterParam === chip.id)
          }
          ariaLabel={tDiscover("page.filterGroups.winterMoodsAria")}
        />
      </div>

      {filterParam && !sectionExists && (
        <p className="text-sm text-olive/70 break-words" role="alert">
          {tDiscover("page.filters.invalid")}{" "}
          <AppLink href="/discover" className={SECTION.aegeanLink}>
            {tCommon("allCategories")}
          </AppLink>
        </p>
      )}
    </div>
  );

  return (
    <StickyFilterBar ariaLabel={tCommon("filterPlaces")}>
      <div className={`${LAYOUT.list} mx-auto space-y-3`}>
        <div role="group" aria-labelledby="discover-filter-label" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-1">
            <span
              className={`${TYPE.kicker} text-olive/60 uppercase tracking-wider`}
              id="discover-filter-label"
            >
              {filter && sectionExists
                ? tDiscover("page.filterAnnouncement.showing", {
                    section: activeSectionTitle,
                    count: totalCount,
                  })
                : tCommon("filterPlaces")}
            </span>
            {filter && sectionExists && (
              <AppLink href="/discover" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
                {tCommon("clearFilter")}
              </AppLink>
            )}
          </div>

          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setFiltersExpanded((v) => !v)}
              className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={filtersExpanded}
              aria-controls="discover-filters"
              id="discover-filters-toggle"
            >
              <span className="text-sm">
                {tDiscover("page.filters.togglePrefix")} {activeFilterLabel}
              </span>
              <span className="text-olive/60 text-xs" aria-hidden>
                {filtersExpanded
                  ? tDiscover("page.filters.toggleHide")
                  : tDiscover("page.filters.toggleShow")}
              </span>
            </button>
            <div
              id="discover-filters"
              role="region"
              aria-labelledby="discover-filters-toggle"
              hidden={!filtersExpanded}
              className="mt-3"
            >
              {filterGroups}
            </div>
          </div>
          <div className="hidden sm:block">{filterGroups}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!stickyPlanVisible && (
            <AppLink href="/plan" className={CTA.primaryCompact}>
              {tCommon("planYourTrip")}
            </AppLink>
          )}
          {hasWineriesInView && !isActivityFilter && (
            <AppLink href="/book/winery" className={CTA.secondaryCompact}>
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
