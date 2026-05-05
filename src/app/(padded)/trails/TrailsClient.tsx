"use client";

import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import { trailConditions } from "@/data/trails";
import { LAYOUT, CTA, SECTION, STRIP, TYPE } from "@/lib/design-tokens";
import TrailCard from "@/components/TrailCard";
import StickyPlanBar from "@/components/StickyPlanBar";
import ListPageHero from "@/components/ListPageHero";
import AllTrailsMapClient from "@/components/AllTrailsMapClient";
import SearchBar from "@/components/SearchBar";
import { useTrailsFilter } from "@/hooks/useTrailsFilter";
import TrailsPlaceOfDay from "@/app/(padded)/trails/TrailsPlaceOfDay";
import TrailsSectionList from "@/app/(padded)/trails/TrailsSectionList";
import TrailsFooter from "@/app/(padded)/trails/TrailsFooter";
import TrailsConditionsStrip from "@/app/(padded)/trails/TrailsConditionsStrip";
import TrailsQuickFilters from "@/app/(padded)/trails/TrailsQuickFilters";
import TrailsFilterBar from "@/app/(padded)/trails/TrailsFilterBar";
import BestConditionsNow from "@/app/(padded)/trails/BestConditionsNow";
import TrailsEmptyState from "@/app/(padded)/trails/TrailsEmptyState";
import TrailStatusGroup from "@/app/(padded)/trails/TrailStatusGroup";
import TrailsTipsSection from "@/app/(padded)/trails/TrailsTipsSection";

export default function TrailsClient() {
  const {
    filtered,
    openTrails,
    cautionTrails,
    closedTrails,
    unknownTrails,
    bestNow,
    counts,
    safeDifficulty,
    safeRegion,
    safeStatus,
    hasFilters,
    hasInvalidFilter,
  } = useTrailsFilter();

  const reportTrail = unknownTrails[0] ?? filtered[0] ?? null;

  const scrollBehavior = () =>
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ? "auto"
      : "smooth";

  const scrollToMap = () => {
    document
      .getElementById("trails-map")
      ?.scrollIntoView({ behavior: scrollBehavior() });
  };

  useEffect(() => {
    if (!hasFilters) return;
    const el = document.getElementById("trail-list");
    const heading = document.getElementById("trail-list-heading");
    if (el) el.scrollIntoView({ behavior: scrollBehavior() });
    if (heading instanceof HTMLElement) {
      heading.focus({ preventScroll: true });
    }
  }, [hasFilters, safeStatus, safeDifficulty, safeRegion]);

  const filterAnnouncement = hasFilters
    ? `Showing ${filtered.length} trails`
    : "Showing all trails by category";

  return (
    <div className="min-h-screen bg-sand">
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {filterAnnouncement}
      </div>
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16`}
      >
        <ListPageHero
          title="Winter Trails"
          description="Pine forest, ridge views, empty paths. Sixteen degrees when home is six."
          descriptionSecondary={`${counts.open} open · ${counts.caution} caution · 8 regions`}
          backHref="/"
          backLabel="Home"
          backgroundImage="/images/cyprus/cyprus-trail-troodos.jpg"
          backgroundImageAlt="Troodos pine forest trail, Cyprus winter"
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Trails", href: "/trails", isCurrent: true }]}
        >
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
            <Link href="/plan" className={CTA.tertiaryOnDark} aria-label="Build a day or pick a template">
              Plan your trip
            </Link>
            <Link href="/weather" className={CTA.ghost} aria-label="View weather forecast">
              Weather
            </Link>
          </div>
        </ListPageHero>

        <div id="trails-plan-sentinel" className="h-px pointer-events-none" aria-hidden />
        <StickyPlanBar sentinelId="trails-plan-sentinel" />

        <section
          aria-labelledby="trails-search-heading"
          role="search"
          className={`${LAYOUT.safeAreaX} -mt-4`}
        >
          <div className={`${LAYOUT.list} mx-auto`}>
            <h2 id="trails-search-heading" className="sr-only">
              Search trails
            </h2>
            <SearchBar
              placeholder="Search trails by name, region, difficulty…"
              className="max-w-2xl mx-auto"
            />
            <p className="text-center text-xs text-olive/60 mt-3 max-w-2xl mx-auto">
              Matches trails (and related places) in our catalog—tap a result to open it. Use filters below to narrow the list.
            </p>
          </div>
        </section>

        <TrailsConditionsStrip
          openCount={counts.open}
          cautionCount={counts.caution}
          closedCount={counts.closed}
        />

        <section
          aria-label="Community trail reports"
          className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-olive/5 border-b border-sand-200/70`}
        >
          <div className={`${LAYOUT.list} mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-olive/85`}>
            <p className="leading-relaxed">
              <span className="font-medium text-olive">Community intel:</span> Cards show a curated winter snapshot from our guide data.
              After you hike, share surface conditions and weather—it helps the next visitor decide.
            </p>
            {reportTrail ? (
              <Link
                href={`/trails/${reportTrail.id}/report`}
                className={`${CTA.secondaryCompact} shrink-0 self-start sm:self-center whitespace-nowrap`}
              >
                Report conditions
              </Link>
            ) : null}
          </div>
        </section>

        <TrailsFilterBar
          filteredCount={filtered.length}
          hasFilters={hasFilters}
          hasInvalidFilter={hasInvalidFilter}
          statusFilter={safeStatus}
          difficultyFilter={safeDifficulty}
          regionFilter={safeRegion}
          openCount={counts.open}
          cautionCount={counts.caution}
          closedCount={counts.closed}
        />

        {!hasFilters && (
          <div className={`${LAYOUT.list} mx-auto ${SECTION.headingGap}`}>
            <TrailsQuickFilters />
          </div>
        )}

        {!hasFilters && <TrailsPlaceOfDay />}

        {bestNow.length > 0 && !hasFilters && <BestConditionsNow trails={bestNow} />}

        {hasFilters ? (
          <section
            aria-labelledby="trail-list-heading"
            className={`${SECTION.pySub} pb-8 sm:pb-12`}
            id="trail-list"
          >
            <div className={`flex flex-wrap items-center justify-between gap-2 ${SECTION.headingGap}`}>
              <h2
                id="trail-list-heading"
                tabIndex={-1}
                className={`${TYPE.sectionTitle} text-xl sm:text-2xl mb-0`}
              >
                {filtered.length} trails
              </h2>
              <Link href="/trails" className={`text-sm font-medium shrink-0 ${SECTION.aegeanLink}`}>
                Clear
              </Link>
            </div>

            {filtered.length === 0 ? (
              <TrailsEmptyState />
            ) : safeStatus ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {filtered.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    conditions={trailConditions[trail.id]}
                    featured={false}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                <TrailStatusGroup
                  label="Open"
                  trails={openTrails}
                  dotColor="bg-aegean"
                  defaultOpen
                />
                <TrailStatusGroup
                  label="Caution"
                  trails={cautionTrails}
                  dotColor="bg-golden"
                  defaultOpen={cautionTrails.length <= 4}
                />
                <TrailStatusGroup
                  label="Closed"
                  trails={closedTrails}
                  dotColor="bg-terracotta"
                />
                <TrailStatusGroup
                  label="No report"
                  trails={unknownTrails}
                  dotColor="bg-sand-300"
                  reportTrailId={unknownTrails[0]?.id}
                  noConditions
                />
              </div>
            )}
          </section>
        ) : (
          <section
            aria-labelledby="trail-sections-heading"
            className={`${SECTION.pySub} pb-8 sm:pb-12`}
            id="trail-list"
          >
            <h2 id="trail-sections-heading" className="sr-only">
              Browse trails by category
            </h2>
            <TrailsSectionList />
          </section>
        )}

        <section
          id="trails-map"
          aria-labelledby="trails-map-heading"
          className={`${SECTION.pySub} border-t border-sand-200/80`}
        >
          <h2 id="trails-map-heading" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
            Map ({filtered.length})
          </h2>
          <p className="text-xs text-olive/60 -mt-2 mb-3">
            Updated from local reports.
          </p>
          <div className="rounded-xl overflow-hidden border border-sand-200/80 h-[min(50vh,360px)] sm:h-[360px]">
            <AllTrailsMapClient trails={filtered} />
          </div>
        </section>

        {!hasFilters && <TrailsTipsSection reportTrail={reportTrail} />}

        <TrailsFooter reportTrailId={reportTrail?.id} onScrollToMap={scrollToMap} />

        {filtered.length > 0 && (
          <div
            className={`fixed left-0 right-0 z-50 flex items-center justify-center py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden ${LAYOUT.fixedBottomClearance}`}
          >
            <Link
              href="/plan"
              className={`flex-1 max-w-sm flex justify-center items-center min-h-[48px] px-6 rounded-xl ${CTA.primaryCompact}`}
              aria-label="Add trails to your plan"
            >
              Add to plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
