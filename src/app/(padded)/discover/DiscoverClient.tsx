"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import StickyPlanBar from "@/components/StickyPlanBar";
import { useTranslations } from "next-intl";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import OnboardingContextualTip from "@/components/OnboardingContextualTip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { CTA, LAYOUT } from "@/lib/design-tokens";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { sortDiscoverItemsByInterests } from "@/lib/personalization";
import { filterToSectionId } from "@/lib/discover-sections";
import type { DiscoverSection } from "@/lib/discover-sections";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import DiscoverFilterBar from "./DiscoverFilterBar";
import DiscoverMapPanel from "./DiscoverMapPanel";
import DiscoverSectionList from "./DiscoverSectionList";
import DiscoverFooter from "./DiscoverFooter";
import { SRStatus } from "@/components/SRStatus";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";

type DiscoverClientProps = {
  sections: DiscoverSection[];
  activitySections?: DiscoverSection[];
};

export default function DiscoverClient({
  sections,
  activitySections = [],
}: DiscoverClientProps) {
  const searchParams = useSearchParams();
  const { prefs, hydrated } = useUserPreferences();
  const { showTipDiscoverFilter, dismissTipDiscoverFilter } = useOnboardingContext();
  const t = useTranslations("onboarding");
  const tDiscover = useTranslations("discover");
  const filterParam = searchParams?.get("filter") ?? "";
  const isActivity = isActivityFilterKey(filterParam);
  const filter = isActivity ? filterParam : filterToSectionId[filterParam];
  const activitySection = isActivity
    ? activitySections.find((s) => s.id === filterParam)
    : undefined;
  const sectionExists = isActivity
    ? !!activitySection
    : !!(filter && sections.some((s) => s.id === filter));

  const sectionsToShow = useMemo(() => {
    const raw = sectionExists
      ? isActivity && activitySection
        ? [activitySection]
        : sections.filter((s) => s.id === filter)
      : sections;
    if (!hydrated || prefs.interests.length === 0 || isActivity) return raw;
    return raw.map((section) => ({
      ...section,
      items: sortDiscoverItemsByInterests(section.items, prefs.interests),
    }));
  }, [sections, activitySection, filter, sectionExists, isActivity, hydrated, prefs.interests]);

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const firstSectionRef = useRef<HTMLElement | null>(null);
  const hasWineriesInView = sectionsToShow.some((s) =>
    s.items.some((i) => "type" in i && i.type === "winery")
  );

  const totalCount = sectionsToShow.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const activeSection = isActivity
    ? activitySection
    : sections.find((s) => s.id === filter);
  const activeSectionTitle = isActivity
    ? tDiscover(`page.filters.${filterParam}`)
    : filterParam === "nature"
      ? tDiscover("page.filters.natureAndCoasts")
      : activeSection
        ? tDiscover(`page.sections.${activeSection.id}`)
        : tDiscover("page.filters.all");
  const { stickyPlanVisible } = useStickyPlanBar();

  const scrollBehavior = () =>
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ? "auto"
      : "smooth";

  const scrollToMap = () => {
    document
      .getElementById("discover-map")
      ?.scrollIntoView({ behavior: scrollBehavior() });
  };

  useEffect(() => {
    if (filter && firstSectionRef.current) {
      firstSectionRef.current.scrollIntoView({ behavior: scrollBehavior() });
      const heading = firstSectionRef.current.querySelector("h2");
      if (heading instanceof HTMLElement) {
        heading.focus({ preventScroll: true });
      }
    }
  }, [filter]);

  const filterAnnouncement =
    filter && sectionExists
      ? tDiscover("page.filterAnnouncement.showing", { section: activeSectionTitle, count: totalCount })
      : tDiscover("page.filterAnnouncement.all");

  return (
    <div
      id="discover-content"
      aria-label={tDiscover("page.contentAria")}
      className="-mt-4 sm:-mt-6"
    >
      <SRStatus message={filterAnnouncement} />
      <StickyPlanBar sentinelId="discover-plan-sentinel" />

      <DiscoverFilterBar
        sections={sections}
        filterParam={filterParam}
        filter={filter}
        sectionExists={!!sectionExists}
        totalCount={totalCount}
        activeSectionTitle={activeSectionTitle}
        hasWineriesInView={hasWineriesInView}
        isActivityFilter={isActivity}
        onScrollToMap={scrollToMap}
      />

      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} flex flex-col gap-4`}>
        {filter && sectionExists && !isActivity && showTipDiscoverFilter && (
          <OnboardingContextualTip
            message={t("tipDiscoverFilter")}
            onDismiss={dismissTipDiscoverFilter}
          />
        )}
        <p className="pt-6 sm:pt-8 pb-2 text-sm text-olive/70">
          {tDiscover("page.curatedLine")}
        </p>

        <div
          role="tablist"
          aria-label={tDiscover("page.viewTabs.aria")}
          className="flex gap-2 pb-4"
          onKeyDown={(e) => {
            const target = e.target as HTMLElement;
            if (target?.getAttribute?.("role") !== "tab") return;
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              if (viewMode === "map") {
                e.preventDefault();
                setViewMode("list");
                document.getElementById("discover-tab-list")?.focus();
              }
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              if (viewMode === "list") {
                e.preventDefault();
                setViewMode("map");
                scrollToMap();
                document.getElementById("discover-tab-map")?.focus();
              }
            }
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "list"}
            aria-controls="discover-list-panel"
            id="discover-tab-list"
            tabIndex={viewMode === "list" ? 0 : -1}
            onClick={() => setViewMode("list")}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 ${
              viewMode === "list" ? CTA.chipPrimary : CTA.chipTertiary
            }`}
          >
            {tDiscover("page.viewTabs.list")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "map"}
            aria-controls="discover-map"
            id="discover-tab-map"
            tabIndex={viewMode === "map" ? 0 : -1}
            onClick={() => {
              setViewMode("map");
              scrollToMap();
            }}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 ${
              viewMode === "map" ? CTA.chipPrimary : CTA.chipTertiary
            }`}
          >
            {tDiscover("page.viewTabs.map")}
          </button>
        </div>

        {viewMode === "list" ? (
          <div
            id="discover-list-panel"
            role="tabpanel"
            aria-labelledby="discover-tab-list"
            className={
              stickyPlanVisible
                ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
                : undefined
            }
          >
            <DiscoverSectionList ref={firstSectionRef} sections={sectionsToShow} />
          </div>
        ) : (
          <div role="tabpanel" aria-labelledby="discover-tab-map">
            <DiscoverMapPanel sections={sectionsToShow} />
          </div>
        )}

        {viewMode === "list" ? (
          <RightNowNearYou title={tDiscover("page.rightNowTitle")} />
        ) : null}

        <DiscoverFooter onScrollToMap={viewMode === "list" ? scrollToMap : undefined} />
      </div>
    </div>
  );
}
