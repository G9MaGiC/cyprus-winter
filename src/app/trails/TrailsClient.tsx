"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trails, trailConditions } from "@/data/trails";
import { winterTipsHiking } from "@/data/winter-tips";
import { LAYOUT, SECTION, CTA, EMPTY_STATE_LARGE, CARD } from "@/lib/design-tokens";
import TrailCard from "@/components/TrailCard";
import StickyPlanBar from "@/components/StickyPlanBar";
import ListPageHero from "@/components/ListPageHero";
import FilterChips from "@/components/FilterChips";
import AllTrailsMapClient from "@/components/AllTrailsMapClient";
import Link from "next/link";

const REGIONS = ["Troodos", "Paphos", "Ayia Napa"] as const;
const DIFFICULTIES = ["easy", "moderate", "hard", "expert"] as const;

export default function TrailsClient() {
  const searchParams = useSearchParams();
  const difficultyFilter = searchParams.get("difficulty") ?? undefined;
  const regionFilter = searchParams.get("region") ?? undefined;

  const validDifficulty = !difficultyFilter || DIFFICULTIES.includes(difficultyFilter as (typeof DIFFICULTIES)[number]);
  const validRegion = !regionFilter || REGIONS.includes(regionFilter as (typeof REGIONS)[number]);
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
  const [filtersExpanded, setFiltersExpanded] = useState(hasFilters);
  const difficultyChips = [
    { id: "", label: "All" },
    ...DIFFICULTIES.map((d) => ({ id: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
  ];
  const regionChips = [{ id: "", label: "All" }, ...REGIONS.map((r) => ({ id: r, label: r }))];
  const filterSummary =
    hasFilters
      ? [safeDifficulty, safeRegion].filter(Boolean).map((v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "")).join(", ")
      : "All";

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <ListPageHero
          title="Cyprus Winter Trails"
          description="Troodos, Paphos, Ayia Napa. Pine forest, ridge views, empty paths. Check conditions before you go."
          backHref="/"
          backLabel="Home"
          backgroundImage="/images/cyprus/cyprus-trail-troodos.jpg"
          backgroundImageAlt="Troodos pine forest trail, Cyprus winter hiking"
        />
        <div className="mb-6 relative">
          <div id="trails-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
          <Link href="/plan" className={`${CTA.primaryCompact}`}>
            Plan your trip
          </Link>
        </div>
        <StickyPlanBar sentinelId="trails-plan-sentinel" />

        <div
          className={`sticky top-0 z-10 ${LAYOUT.stickyBarX} pt-2 pb-4 -mt-2 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90`}
          role="region"
          aria-label="Filters and stats"
        >
            <div className={`flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6 mb-6 rounded-xl ${CARD.base} ${CARD.content}`}>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-display font-bold text-olive">{filtered.length}</span>
              <span className="text-sm text-olive/70">trails</span>
            </div>
            <span className="w-full sm:w-px sm:h-6 sm:min-h-0 h-px bg-sand-200" aria-hidden />
            <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-aegean shrink-0" aria-hidden />
                <span className="text-lg font-display font-semibold text-aegean">{openCount}</span>
                <span className="text-sm text-olive/70">open</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-golden shrink-0" aria-hidden />
                <span className="text-lg font-display font-semibold text-charcoal">{cautionCount}</span>
                <span className="text-sm text-olive/70">caution</span>
              </div>
              {closedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-terracotta shrink-0" aria-hidden />
                  <span className="text-lg font-display font-semibold text-terracotta">{closedCount}</span>
                  <span className="text-sm text-olive/70">closed</span>
                </div>
              )}
            </div>
          </div>
          <section aria-label="Filter trails" className="mb-10 sm:mb-12">
            {/* Mobile: collapsible filter bar */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setFiltersExpanded((v) => !v)}
                className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-expanded={filtersExpanded}
                aria-controls="trail-filters"
                id="trail-filters-toggle"
              >
                <span className="text-sm">Filters: {filterSummary}</span>
                <span className="text-olive/60 text-xs" aria-hidden>
                  {filtersExpanded ? "Hide" : "Show"}
                </span>
              </button>
              <div
                id="trail-filters"
                role="region"
                aria-labelledby="trail-filters-toggle"
                hidden={!filtersExpanded}
                className="mt-3 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-olive/60 uppercase tracking-wider w-full">Difficulty</span>
                  <FilterChips
                    chips={difficultyChips}
                    isActive={(chip) => (chip.id === "" ? !safeDifficulty : safeDifficulty === chip.id)}
                    getHref={(chip) => {
                      const q = new URLSearchParams();
                      if (chip.id) q.set("difficulty", chip.id);
                      if (safeRegion) q.set("region", safeRegion);
                      return q.toString() ? `/trails?${q.toString()}` : "/trails";
                    }}
                    ariaLabel="Filter by difficulty"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-olive/60 uppercase tracking-wider w-full">Region</span>
                  <FilterChips
                    chips={regionChips}
                    isActive={(chip) => (chip.id === "" ? !safeRegion : safeRegion === chip.id)}
                    getHref={(chip) => {
                      const q = new URLSearchParams();
                      if (safeDifficulty) q.set("difficulty", safeDifficulty);
                      if (chip.id) q.set("region", chip.id);
                      return q.toString() ? `/trails?${q.toString()}` : "/trails";
                    }}
                    ariaLabel="Filter by region"
                  />
                </div>
              </div>
            </div>
            {/* Desktop: always visible filters */}
            <div className="hidden sm:flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-olive/60 uppercase tracking-wider">Difficulty</span>
                <FilterChips
                  chips={difficultyChips}
                  isActive={(chip) => (chip.id === "" ? !safeDifficulty : safeDifficulty === chip.id)}
                  getHref={(chip) => {
                    const q = new URLSearchParams();
                    if (chip.id) q.set("difficulty", chip.id);
                    if (safeRegion) q.set("region", safeRegion);
                    return q.toString() ? `/trails?${q.toString()}` : "/trails";
                  }}
                  ariaLabel="Filter by difficulty"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-olive/60 uppercase tracking-wider">Region</span>
                <FilterChips
                  chips={regionChips}
                  isActive={(chip) => (chip.id === "" ? !safeRegion : safeRegion === chip.id)}
                  getHref={(chip) => {
                    const q = new URLSearchParams();
                    if (safeDifficulty) q.set("difficulty", safeDifficulty);
                    if (chip.id) q.set("region", chip.id);
                    return q.toString() ? `/trails?${q.toString()}` : "/trails";
                  }}
                  ariaLabel="Filter by region"
                />
              </div>
            </div>
          </section>
        </div>

        {bestNow.length > 0 && !hasFilters && (
          <section aria-labelledby="best-now" className="mb-12 sm:mb-16">
            <h2 id="best-now" className={`font-display text-lg font-semibold text-olive ${SECTION.titleGap}`}>
              Best right now
            </h2>
            <p className={`text-sm text-olive/70 ${SECTION.headingGap}`}>
              Open, dry, good conditions. Start here.
            </p>
            <div className="space-y-4">
              {bestNow.map((trail) => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  conditions={trailConditions[trail.id]}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="trails-map" className="mb-12 sm:mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 id="trails-map" className="font-display text-lg font-semibold text-olive">
              On the map
            </h2>
            <span className="text-xs text-olive/50">{filtered.length} trails</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-sand-200/80 shadow-sm h-[300px] sm:h-[360px]">
            <AllTrailsMapClient trails={filtered} />
          </div>
        </section>

        <section aria-labelledby="trail-list" className="mb-0">
          <h2 id="trail-list" className={`font-display text-lg font-semibold text-olive ${SECTION.headingGap}`}>
            {hasFilters ? `Trails (${filtered.length})` : "All trails"}
          </h2>

          {filtered.length === 0 ? (
            <div className={`${EMPTY_STATE_LARGE} max-w-md mx-auto`} role="status" aria-live="polite">
              <p className="text-olive/80 leading-relaxed break-words mb-8">
                No trails match. Try a different difficulty or region—Artemis, Caledonia, coastal paths.
              </p>
              <Link href="/trails" className={`inline-flex justify-center min-w-[140px] ${CTA.primaryCompact}`}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {openTrails.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3 sm:mb-4">
                    <span className="w-2 h-2 rounded-full bg-aegean" aria-hidden />
                    Open ({openTrails.length})
                  </h3>
                  <div className="space-y-4">
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
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3 sm:mb-4">
                    <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
                    Caution ({cautionTrails.length})
                  </h3>
                  <div className="space-y-4">
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
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3 sm:mb-4">
                    <span className="w-2 h-2 rounded-full bg-terracotta" aria-hidden />
                    Closed ({closedTrails.length})
                  </h3>
                  <div className="space-y-4">
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
                  <h3 className="flex items-center gap-2 text-sm font-medium text-olive/80 mb-3 sm:mb-4">
                    <span className="w-2 h-2 rounded-full bg-sand-300" aria-hidden />
                    No report yet—be the first ({unknownTrails.length})
                  </h3>
                  <div className="space-y-4">
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
                    Been there? Report conditions to help others.
                    {unknownTrails.length > 0 && (
                      <>
                        {" "}
                        <Link
                          href={`/trails/${unknownTrails[0].id}/report`}
                          className="font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                        >
                          Report {unknownTrails[0].name} now
                        </Link>
                        {unknownTrails.length > 1 ? " or any other trail." : "."}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          className="mt-12 sm:mt-16 rounded-xl overflow-hidden border border-sand-200/80 bg-white/90 shadow-sm"
          aria-labelledby="winter-hiking"
        >
          <div className="px-6 py-4 bg-sand-100/80 border-b border-sand-200/80">
            <h2 id="winter-hiking" className="font-display font-semibold text-olive">
              Winter hiking
            </h2>
            <p className="text-sm text-olive/70 mt-0.5">What to know before you go</p>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-200/80">
            {winterTipsHiking.slice(0, 4).map((tip) => (
              <div key={tip.id} className="px-6 py-4 sm:p-5">
                <h3 className="font-display font-medium text-olive text-sm">{tip.title}</h3>
                <p className="text-sm text-olive/80 mt-1 leading-relaxed break-words">{tip.body}</p>
              </div>
            ))}
          </div>
          {winterTipsHiking.length > 4 && (
            <div className="px-6 py-3 bg-sand-100/50 border-t border-sand-200/80">
              <Link
                href="/plan"
                className="text-sm font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                Build your day → add trails to your plan
              </Link>
            </div>
          )}
        </section>

        <div className={`mt-12 sm:mt-16 ${CARD.base} ${CARD.contentLg} bg-aegean/10 border border-aegean/20 text-center`}>
          <p className="text-sm text-olive/90 font-medium mb-2">
            Just back from a trail?
          </p>
          <p className="text-sm text-olive/70 mb-4">
            Report conditions and help others decide. Quick form on each trail page.
          </p>
          <Link
            href={filtered.length > 0 && (unknownTrails[0] ?? filtered[0]) ? `/trails/${(unknownTrails[0] ?? filtered[0])!.id}/report` : "/trails"}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-aegean text-white font-medium hover:bg-aegean/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Report conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
