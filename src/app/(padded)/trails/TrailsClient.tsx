"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trails, trailConditions, TRAIL_COUNT, TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { winterTipsHiking } from "@/data/winter-tips";
import { LAYOUT, SECTION, CTA, EMPTY_STATE_LARGE, TYPE, STRIP } from "@/lib/design-tokens";
import TrailCard from "@/components/TrailCard";
import StickyPlanBar from "@/components/StickyPlanBar";
import ListPageHero from "@/components/ListPageHero";
import TrailFilters from "@/app/(padded)/trails/TrailFilters";
import AllTrailsMapClient from "@/components/AllTrailsMapClient";
import Link from "next/link";

export default function TrailsClient() {
  const searchParams = useSearchParams();
  const difficultyFilter = searchParams.get("difficulty") ?? undefined;
  const regionFilter = searchParams.get("region") ?? undefined;

  const validDifficulty = !difficultyFilter || TRAIL_DIFFICULTIES.includes(difficultyFilter as (typeof TRAIL_DIFFICULTIES)[number]);
  const validRegion = !regionFilter || TRAIL_REGIONS.includes(regionFilter as (typeof TRAIL_REGIONS)[number]);
  const safeDifficulty = validDifficulty ? difficultyFilter : undefined;
  const safeRegion = validRegion ? regionFilter : undefined;

  const filtered = trails.filter((t) => {
    if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
    if (safeRegion && t.region !== safeRegion) return false;
    return true;
  });

  const openTrails = filtered.filter((t) => trailConditions[t.id]?.status === "open");
  const cautionTrails = filtered.filter((t) => trailConditions[t.id]?.status === "caution");
  const closedTrails = filtered.filter((t) => trailConditions[t.id]?.status === "closed");
  const unknownTrails = filtered.filter((t) => !trailConditions[t.id]?.status);

  const openCount = openTrails.length;
  const cautionCount = cautionTrails.length;
  const closedCount = closedTrails.length;

  const bestNow = filtered
    .filter((t) => {
      const c = trailConditions[t.id];
      return c?.status === "open" && (c.surface === "dry" || !c.surface) && (c.temperatureC == null || c.temperatureC >= 10);
    })
    .slice(0, 3);

  const hasFilters = Boolean(safeDifficulty || safeRegion);
  const hasInvalidFilter = (difficultyFilter && !validDifficulty) || (regionFilter && !validRegion);
  const [filtersExpanded, setFiltersExpanded] = useState(hasFilters);
  const [mapOpen, setMapOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const filterSummary =
    hasFilters
      ? [safeDifficulty, safeRegion].filter(Boolean).map((v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "")).join(", ")
      : "All";

  const statusLabel =
    openCount > 0 && closedCount === 0 && cautionCount === 0
      ? "Good to go"
      : cautionCount > 0 && closedCount === 0
        ? "Check before you go"
        : closedCount > 0
          ? "Some trails closed"
          : filtered.length > 0
            ? "Report conditions"
            : "";

  return (
    <div className="min-h-screen bg-sand">
      {/* Mobile-first: compact container, full bleed on small screens */}
        <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} pt-0 pb-28 sm:pt-12 sm:pb-0`}>
        {/* Compact hero — shorter on mobile */}
        <ListPageHero
          title="Winter Trails"
          description="Pine forest, ridge views, empty paths."
          descriptionSecondary={`${TRAIL_COUNT} trails · 8 regions`}
          backHref="/"
          backLabel="Home"
          backgroundImage="/images/cyprus/cyprus-trail-troodos.jpg"
          backgroundImageAlt="Troodos pine forest trail, Cyprus winter"
          hasWidgetStrip
        >
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
            <Link href="/plan" className={CTA.tertiaryOnDark}>
              Plan trip
            </Link>
            <Link href="/weather" className={CTA.ghost}>
              Weather
            </Link>
          </div>
        </ListPageHero>
        <StickyPlanBar sentinelId="trails-plan-sentinel" />

        {/* Status strip — horizontal pills, mobile-first */}
        <section
          aria-label="Trail conditions summary"
          className={`${LAYOUT.safeAreaX} ${STRIP.pyCompact} border-b border-sand-200/80 -mx-[max(1.5rem,env(safe-area-inset-left))] px-[max(1.5rem,env(safe-area-inset-left))] sm:mx-0 sm:px-0`}
        >
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none -mx-1 px-1 scroll-smooth">
            <span className="text-sm font-medium text-olive shrink-0">{statusLabel}</span>
            <span className="text-olive/30 shrink-0" aria-hidden>·</span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-aegean" aria-hidden />
              <span className="text-sm text-aegean font-medium">{openCount} open</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
              <span className="text-sm text-olive/80">{cautionCount} caution</span>
            </span>
            {closedCount > 0 && (
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-terracotta" aria-hidden />
                <span className="text-sm text-terracotta">{closedCount} closed</span>
              </span>
            )}
          </div>
        </section>

        {/* Filters — always visible horizontal chips on mobile, no toggle */}
        <div className={`${LAYOUT.safeAreaX} pt-4 pb-5 sm:pt-6 sm:pb-6 border-b border-sand-200/80`}>
          <div className="flex flex-wrap items-baseline gap-x-2 mb-2 sm:mb-3">
            <p className="text-xs font-medium text-olive/60 uppercase tracking-wider">
              {filtered.length} trails
            </p>
            {hasInvalidFilter && (
              <span className="text-xs text-olive/60" role="status">
                — Unknown filter, showing all
              </span>
            )}
          </div>
          <TrailFilters
            difficultyFilter={safeDifficulty}
            regionFilter={safeRegion}
            filtersExpanded={filtersExpanded}
            onToggleExpand={() => setFiltersExpanded((v) => !v)}
            filterSummary={filterSummary}
            alwaysVisible
          />
        </div>

        {/* Best right now — first on mobile (most relevant) */}
        {bestNow.length > 0 && !hasFilters && (
          <section
            aria-labelledby="best-now"
            aria-describedby="best-now-desc"
            role="complementary"
            className="pt-6 pb-8 sm:pt-10 sm:pb-12"
          >
            <h2 id="best-now" className={`${TYPE.sectionTitle} text-xl sm:text-2xl ${SECTION.titleGap}`}>
              Best right now
            </h2>
            <p id="best-now-desc" className="text-sm text-olive/70 mb-4 sm:mb-6">
              Open, dry, good conditions.
            </p>
            <div className="flex gap-3 overflow-x-auto scroll-smooth scroll-touch pb-2 -mx-[max(1.5rem,env(safe-area-inset-left))] px-[max(1.5rem,env(safe-area-inset-left))] sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:gap-6">
              {bestNow.map((trail) => (
                <div key={trail.id} className="shrink-0 w-[85vw] max-w-[320px] sm:w-auto sm:max-w-none snap-start">
                  <TrailCard
                    trail={trail}
                    conditions={trailConditions[trail.id]}
                    featured
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trail list — primary content, single column on mobile */}
        <section aria-labelledby="trail-list-heading" className="pt-4 sm:pt-8 pb-8 sm:pb-12" id="trail-list">
          <div className={`flex flex-wrap items-center justify-between gap-2 ${SECTION.headingGap}`}>
            <h2 id="trail-list-heading" className={`${TYPE.sectionTitle} text-xl sm:text-2xl mb-0`}>
              {hasFilters ? `${filtered.length} trails` : "All trails"}
            </h2>
            {hasFilters && (
              <Link
                href="/trails"
                className="text-sm font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded shrink-0"
              >
                Clear
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className={`${EMPTY_STATE_LARGE} max-w-md mx-auto`} role="status" aria-live="polite">
              <p className="text-olive/80 leading-relaxed break-words mb-6">
                No trails match. Try a different difficulty or region.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/trails" className={`inline-flex justify-center min-w-[140px] ${CTA.primaryCompact}`}>
                  All trails
                </Link>
                <Link href="/discover" className={CTA.secondaryCompact}>
                  Discover
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {openTrails.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3">
                    <span className="w-2 h-2 rounded-full bg-aegean" aria-hidden />
                    Open ({openTrails.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {openTrails.map((trail) => (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        conditions={trailConditions[trail.id]}
                        featured={false}
                      />
                    ))}
                  </div>
                </div>
              )}
              {cautionTrails.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3">
                    <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
                    Caution ({cautionTrails.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {cautionTrails.map((trail) => (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        conditions={trailConditions[trail.id]}
                        featured={false}
                      />
                    ))}
                  </div>
                </div>
              )}
              {closedTrails.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3">
                    <span className="w-2 h-2 rounded-full bg-terracotta" aria-hidden />
                    Closed ({closedTrails.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {closedTrails.map((trail) => (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        conditions={trailConditions[trail.id]}
                        featured={false}
                      />
                    ))}
                  </div>
                </div>
              )}
              {unknownTrails.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3">
                    <span className="w-2 h-2 rounded-full bg-sand-300" aria-hidden />
                    No report ({unknownTrails.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {unknownTrails.map((trail) => (
                      <TrailCard
                        key={trail.id}
                        trail={trail}
                        conditions={undefined}
                        featured={false}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-olive/70">
                    <Link
                      href={`/trails/${unknownTrails[0].id}/report`}
                      className="font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded"
                    >
                      Report conditions
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Map — collapsible on mobile, always visible on desktop */}
        <section aria-labelledby="trails-map-heading" className="pt-6 pb-8 sm:pt-10 sm:pb-12 border-t border-sand-200/80">
          <button
            type="button"
            onClick={() => setMapOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded-lg sm:mb-6 sm:cursor-default sm:pointer-events-none"
            aria-expanded={mapOpen}
            aria-controls="trails-map-region"
          >
            <h2 id="trails-map-heading" className={`${TYPE.sectionTitle} text-xl sm:text-2xl mb-0`}>
              On the map
            </h2>
            <span className="text-sm text-olive/60 shrink-0 ml-2 sm:hidden">
              {mapOpen ? "Hide" : "Show"} ({filtered.length})
            </span>
          </button>
          <div
            id="trails-map-region"
            className={`overflow-hidden ${!mapOpen ? "hidden sm:block" : ""}`}
          >
            <div className="rounded-xl overflow-hidden border border-sand-200/80 h-[min(50vh,360px)] sm:h-[360px]">
              <AllTrailsMapClient trails={filtered} />
            </div>
          </div>
        </section>

        {/* Before you go — collapsible on mobile, expanded on desktop */}
        <section aria-labelledby="tips-heading" className="pt-6 pb-8 sm:pt-10 sm:pb-12 border-t border-sand-200/80">
          <button
            type="button"
            onClick={() => setTipsOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded-lg sm:pointer-events-none sm:cursor-default"
            aria-expanded={tipsOpen}
            aria-controls="trails-tips-region"
          >
            <h2 id="tips-heading" className={`${TYPE.sectionTitle} text-xl sm:text-2xl mb-0`}>
              Before you go
            </h2>
            <span className="text-sm text-olive/60 shrink-0 ml-2 sm:hidden">
              {tipsOpen ? "Hide" : "Show"}
            </span>
          </button>
          <div
            id="trails-tips-region"
            className={`mt-4 rounded-xl bg-sand-100/80 border border-sand-200/80 p-4 sm:p-6 ${!tipsOpen ? "hidden sm:block" : ""}`}
          >
            <p className="text-sm text-olive/70 mb-4">Winter hiking tips</p>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-200/80">
              {winterTipsHiking.slice(0, 4).map((tip) => (
                <div key={tip.id} className="py-3 sm:py-0 sm:px-6 first:pt-0 last:pb-0 sm:first:pl-0 sm:last:pr-0">
                  <h3 className="font-display font-medium text-olive text-sm">{tip.title}</h3>
                  <p className="text-sm text-olive/80 mt-1 leading-relaxed break-words">{tip.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-sand-200/80">
              <Link href="/plan" className="text-sm font-medium text-terracotta hover:underline">
                Add trails to your plan →
              </Link>
            </div>
          </div>
        </section>

        {/* Report CTA */}
        <section className="pt-6 pb-8 sm:pt-10 sm:pb-12 border-t border-sand-200/80 text-center">
          <p className="text-sm text-olive/70 mb-3">Been there? Report conditions.</p>
          <Link
            href={filtered.length > 0 && (unknownTrails[0] ?? filtered[0]) ? `/trails/${(unknownTrails[0] ?? filtered[0])!.id}/report` : "/trails"}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-aegean text-white font-medium hover:bg-aegean/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean focus-visible:ring-offset-2"
          >
            Report conditions
          </Link>
        </section>

        {/* Sticky bottom CTA — mobile only */}
        {filtered.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center py-3 px-4 bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <Link
              href="/plan"
              className={`flex-1 max-w-sm flex justify-center items-center min-h-[48px] px-6 rounded-xl ${CTA.primaryCompact}`}
            >
              Add to plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
