"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StickyPlanBar from "@/components/StickyPlanBar";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import OnboardingContextualTip from "@/components/OnboardingContextualTip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { CTA, EMPTY_STATE, LAYOUT } from "@/lib/design-tokens";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { sortDiscoverItemsByInterests } from "@/lib/personalization";
import { filterToSectionId } from "@/lib/discover-sections";
import type { DiscoverCardSection } from "@/lib/discover-sections";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import { getPlanDayIndex, getPlanDayMapFocus } from "@/lib/discover-map-focus";
import { buildDiscoverHubHref } from "@/lib/discover-hub-url";
import { useTripDates } from "@/hooks/useTripDates";
import { useItinerary } from "@/hooks/useItinerary";
import DiscoverFilterBar from "./DiscoverFilterBar";
import DiscoverMapPanel from "./DiscoverMapPanel";
import DiscoverPlaceOfDay from "./DiscoverPlaceOfDay";
import DiscoverSectionList from "./DiscoverSectionList";
import DiscoverFooter from "./DiscoverFooter";
import { SRStatus } from "@/components/SRStatus";
import AskAIButton from "@/components/AskAIButton";
import AppLink from "@/components/AppLink";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";

const MAP_FOCUS_STORAGE_KEY = "cyprus-winter:discover-map-focus";

type DiscoverClientProps = {
  sections: DiscoverCardSection[];
  activitySections?: DiscoverCardSection[];
};

function loadMapFocusPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MAP_FOCUS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveMapFocusPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MAP_FOCUS_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // ignore
  }
}

export default function DiscoverClient({
  sections,
  activitySections = [],
}: DiscoverClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { prefs, hydrated } = useUserPreferences();
  const { showTipDiscoverFilter, dismissTipDiscoverFilter } = useOnboardingContext();
  const t = useTranslations("onboarding");
  const tDiscover = useTranslations("discover");
  const filterParam = searchParams?.get("filter") ?? "";
  const urlViewMap = searchParams?.get("view") === "map";
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

  const [viewMode, setViewMode] = useState<"list" | "map">(urlViewMap ? "map" : "list");
  const [mapFocusMode, setMapFocusMode] = useState(false);
  const firstSectionRef = useRef<HTMLElement | null>(null);

  const { dates, hydrated: datesHydrated } = useTripDates();
  const { days, activeDay, hydrated: planHydrated } = useItinerary();

  const planDay = useMemo(
    () => getPlanDayIndex(dates, activeDay),
    [dates, activeDay]
  );

  const planFocus = useMemo(
    () =>
      datesHydrated && planHydrated
        ? getPlanDayMapFocus(days, planDay, dates)
        : {
            enabled: false,
            planDay,
            placeIds: [] as string[],
            center: null,
            bounds: null,
          },
    [days, planDay, dates, datesHydrated, planHydrated]
  );

  const hasWineriesInView = sectionsToShow.some((s) =>
    s.items.some((i) => "type" in i && i.type === "winery")
  );

  const totalCount = sectionsToShow.reduce((sum, s) => sum + s.items.length, 0);
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

  useEffect(() => {
    setMapFocusMode(loadMapFocusPreference());
  }, []);

  useEffect(() => {
    setViewMode(urlViewMap ? "map" : "list");
  }, [urlViewMap]);

  const replaceDiscoverUrl = useCallback(
    (nextViewMap: boolean) => {
      router.replace(buildDiscoverHubHref(filterParam, { viewMap: nextViewMap }));
    },
    [router, filterParam]
  );

  const scrollBehavior = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const openMapView = useCallback(() => {
    setViewMode("map");
    replaceDiscoverUrl(true);
    requestAnimationFrame(() => {
      document
        .getElementById("discover-map")
        ?.scrollIntoView({ behavior: scrollBehavior() });
    });
  }, [replaceDiscoverUrl]);

  const setListView = useCallback(() => {
    setViewMode("list");
    replaceDiscoverUrl(false);
  }, [replaceDiscoverUrl]);

  const handleFocusModeChange = useCallback((enabled: boolean) => {
    setMapFocusMode(enabled);
    saveMapFocusPreference(enabled);
  }, []);

  const handleResetMapView = useCallback(() => {
    setMapFocusMode(false);
    saveMapFocusPreference(false);
  }, []);

  useEffect(() => {
    if (filter && firstSectionRef.current && viewMode === "list") {
      firstSectionRef.current.scrollIntoView({ behavior: scrollBehavior() });
      const heading = firstSectionRef.current.querySelector("h2");
      if (heading instanceof HTMLElement) {
        heading.focus({ preventScroll: true });
      }
    }
  }, [filter, viewMode]);

  const filterAnnouncement =
    filter && sectionExists
      ? tDiscover("page.filterAnnouncement.showing", {
          section: activeSectionTitle,
          count: totalCount,
        })
      : tDiscover("page.filterAnnouncement.all");

  return (
    <div
      id="discover-content"
      aria-label={tDiscover("page.contentAria")}
      className="-mt-4 sm:-mt-6 scroll-mt-24 sm:scroll-mt-28"
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
        viewMode={viewMode}
        onOpenMap={openMapView}
      />

      {viewMode === "list" ? <DiscoverPlaceOfDay /> : null}

      {viewMode === "list" && totalCount > 0 ? (
        <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX}`}>
          <RightNowNearYou title={tDiscover("page.rightNowTitle")} />
        </div>
      ) : null}

      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} flex flex-col gap-4`}>
        {filter && sectionExists && !isActivity && showTipDiscoverFilter && viewMode === "list" ? (
          <OnboardingContextualTip
            message={t("tipDiscoverFilter")}
            onDismiss={dismissTipDiscoverFilter}
          />
        ) : null}
        {viewMode === "list" ? (
          <p className="pt-6 sm:pt-8 pb-2 text-sm text-muted-ink">
            {tDiscover("page.curatedLine")}
          </p>
        ) : null}

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
                setListView();
                document.getElementById("discover-tab-list")?.focus();
              }
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              if (viewMode === "list") {
                e.preventDefault();
                openMapView();
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
            onClick={setListView}
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
            onClick={openMapView}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 ${
              viewMode === "map" ? CTA.chipPrimary : CTA.chipTertiary
            }`}
          >
            {tDiscover("page.viewTabs.map")}
          </button>
        </div>

        {totalCount === 0 && filter ? (
          <div className={EMPTY_STATE} role="status" aria-live="polite">
            <p className="text-lg font-semibold text-olive mb-2">
              {tDiscover("page.noResultsTitle")}
            </p>
            <p className="text-muted-ink mb-6">{tDiscover("page.noResultsBody")}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <AppLink
                href="/discover"
                className={`min-w-[120px] justify-center ${CTA.primaryCompact}`}
              >
                {tDiscover("page.clearFilter")}
              </AppLink>
              <AskAIButton className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`} />
            </div>
          </div>
        ) : viewMode === "list" ? (
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
            <DiscoverSectionList
              ref={firstSectionRef}
              sections={sectionsToShow}
              capPerSection={sectionsToShow.length > 1 ? 6 : undefined}
            />
          </div>
        ) : (
          <div role="tabpanel" aria-labelledby="discover-tab-map">
            <DiscoverMapPanel
              sections={sectionsToShow}
              isActivityFilter={isActivity}
              planFocus={planFocus}
              focusMode={mapFocusMode}
              onFocusModeChange={handleFocusModeChange}
              onResetView={handleResetMapView}
            />
          </div>
        )}

        <DiscoverFooter onScrollToMap={viewMode === "list" ? openMapView : undefined} />
      </div>
    </div>
  );
}
