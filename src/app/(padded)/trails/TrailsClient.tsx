"use client";

import { useSearchParams } from "next/navigation";
import { trails, trailConditions, TRAIL_COUNT, TRAIL_REGIONS, TRAIL_DIFFICULTIES } from "@/data/trails";
import { winterTipsHiking } from "@/data/winter-tips";
import { LAYOUT, CTA, EMPTY_STATE_LARGE, SECTION, TYPE } from "@/lib/design-tokens";
import TrailCard from "@/components/TrailCard";
import StickyPlanBar from "@/components/StickyPlanBar";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import ListPageHero from "@/components/ListPageHero";
import TrailFilters from "@/app/(padded)/trails/TrailFilters";
import AllTrailsMapClient from "@/components/AllTrailsMapClient";
import Disclosure from "@/components/Disclosure";
import Link from "next/link";
import type { TrailStatus } from "@/data/trails";

const STATUS_OPTIONS: { id: TrailStatus | ""; label: string }[] = [
  { id: "", label: "All status" },
  { id: "open", label: "Open" },
  { id: "caution", label: "Caution" },
  { id: "closed", label: "Closed" },
];

export default function TrailsClient() {
  const searchParams = useSearchParams();
  const difficultyFilter = searchParams.get("difficulty") ?? undefined;
  const regionFilter = searchParams.get("region") ?? undefined;
  const statusFilter = (searchParams.get("status") ?? undefined) as TrailStatus | undefined;

  const validDifficulty = !difficultyFilter || TRAIL_DIFFICULTIES.includes(difficultyFilter as (typeof TRAIL_DIFFICULTIES)[number]);
  const validRegion = !regionFilter || TRAIL_REGIONS.includes(regionFilter as (typeof TRAIL_REGIONS)[number]);
  const validStatus = !statusFilter || STATUS_OPTIONS.some((s) => s.id === statusFilter);
  const safeDifficulty = validDifficulty ? difficultyFilter : undefined;
  const safeRegion = validRegion ? regionFilter : undefined;
  const safeStatus = validStatus ? statusFilter : undefined;

  const filtered = trails.filter((t) => {
    if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
    if (safeRegion && t.region !== safeRegion) return false;
    if (safeStatus) {
      const s = trailConditions[t.id]?.status;
      if (s !== safeStatus) return false;
    }
    return true;
  });

  const openTrails = filtered.filter((t) => trailConditions[t.id]?.status === "open");
  const cautionTrails = filtered.filter((t) => trailConditions[t.id]?.status === "caution");
  const closedTrails = filtered.filter((t) => trailConditions[t.id]?.status === "closed");
  const unknownTrails = filtered.filter((t) => !trailConditions[t.id]?.status);

  const openCount = trails.filter((t) => {
    if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
    if (safeRegion && t.region !== safeRegion) return false;
    return trailConditions[t.id]?.status === "open";
  }).length;
  const cautionCount = trails.filter((t) => {
    if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
    if (safeRegion && t.region !== safeRegion) return false;
    return trailConditions[t.id]?.status === "caution";
  }).length;
  const closedCount = trails.filter((t) => {
    if (safeDifficulty && t.difficulty !== safeDifficulty) return false;
    if (safeRegion && t.region !== safeRegion) return false;
    return trailConditions[t.id]?.status === "closed";
  }).length;

  const bestNow = filtered
    .filter((t) => {
      const c = trailConditions[t.id];
      return c?.status === "open" && (c.surface === "dry" || !c.surface) && (c.temperatureC == null || c.temperatureC >= 10);
    })
    .slice(0, 3);

  const hasFilters = Boolean(safeDifficulty || safeRegion || safeStatus);
  const hasInvalidFilter = (difficultyFilter && !validDifficulty) || (regionFilter && !validRegion) || (statusFilter && !validStatus);

  return (
    <div className="min-h-screen bg-sand">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16`}>
        <ListPageHero
          title="Winter Trails"
          description="Pine forest, ridge views, empty paths. Sixteen degrees when home is six."
          descriptionSecondary={`${TRAIL_COUNT} trails · 8 regions`}
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

        {/* Sticky filter bar — Discover-style */}
        <div
          role="region"
          aria-label="Trail filters"
          className={`sticky ${LAYOUT.stickyTop} z-10 bg-background/98 backdrop-blur-md border-b border-sand-200/60 ${LAYOUT.stickyBarX} py-4 sm:py-5`}
        >
          <div className={`${LAYOUT.list} mx-auto space-y-4`}>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="prose-label text-olive/60 uppercase tracking-wider">
                Filter trails
              </span>
              <span className="text-olive/60 text-sm">{filtered.length} trails</span>
              {hasFilters && (
                <Link href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink} ml-auto sm:ml-2`}>
                  Clear filters
                </Link>
              )}
              {hasInvalidFilter && (
                <span className="text-xs text-olive/60" role="status">— Showing all</span>
              )}
            </div>
            <TrailFilters
              statusFilter={safeStatus}
              difficultyFilter={safeDifficulty}
              regionFilter={safeRegion}
              openCount={openCount}
              cautionCount={cautionCount}
              closedCount={closedCount}
            />
          </div>
        </div>

        {/* Best now — sage accent for trail/nature */}
        {bestNow.length > 0 && !hasFilters && (
          <section
            aria-labelledby="best-now"
            role="complementary"
            className={`${SECTION.pySub} pl-6 sm:pl-8 border-l-4 border-sage/50`}
          >
            <h2 id="best-now" className={`${TYPE.sectionTitle} text-xl sm:text-2xl ${SECTION.headingGap}`}>
              Best conditions now
            </h2>
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

        {/* Trail list */}
        <section aria-labelledby="trail-list-heading" className={`${SECTION.pySub} pb-8 sm:pb-12`} id="trail-list">
          <div className={`flex flex-wrap items-center justify-between gap-2 ${SECTION.headingGap}`}>
            <h2 id="trail-list-heading" className={`${TYPE.sectionTitle} text-xl sm:text-2xl mb-0`}>
              {hasFilters ? `${filtered.length} trails` : "All trails"}
            </h2>
            {hasFilters && (
              <Link href="/trails" className={`text-sm font-medium shrink-0 ${SECTION.aegeanLink}`}>
                Clear
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className={`${EMPTY_STATE_LARGE} max-w-md mx-auto`} role="status" aria-live="polite">
              <p className="text-olive/80 leading-relaxed break-words mb-6">
                No trails match your filters. Try different status, difficulty, or region—or ask the AI. It knows Troodos to coast.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/trails" className={`inline-flex justify-center min-w-[140px] ${CTA.primaryCompact}`}>
                  All trails
                </Link>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
                  className={CTA.secondaryCompact}
                  aria-label="Ask AI for trail suggestions"
                >
                  Ask AI
                </button>
                <Link href="/discover" className={CTA.secondaryCompact}>
                  Discover
                </Link>
              </div>
            </div>
          ) : safeStatus ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {filtered.map((trail) => (
                <TrailCard key={trail.id} trail={trail} conditions={trailConditions[trail.id]} featured={false} />
              ))}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {openTrails.length > 0 && (
                <details className="group" open>
                  <summary className="list-none cursor-pointer flex items-center gap-2 text-sm font-medium text-olive/80 mb-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] items-center">
                    <span className="w-2 h-2 rounded-full bg-aegean shrink-0" aria-hidden />
                    Open ({openTrails.length})
                    <span className="text-olive/50 group-open:rotate-180 ml-1 transition-transform duration-200" aria-hidden>▾</span>
                  </summary>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {openTrails.map((trail) => (
                      <TrailCard key={trail.id} trail={trail} conditions={trailConditions[trail.id]} featured={false} />
                    ))}
                  </div>
                </details>
              )}
              {cautionTrails.length > 0 && (
                <details className="group" open={cautionTrails.length <= 4}>
                  <summary className="list-none cursor-pointer flex items-center gap-2 text-sm font-medium text-olive/80 mb-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] items-center">
                    <span className="w-2 h-2 rounded-full bg-golden shrink-0" aria-hidden />
                    Caution ({cautionTrails.length})
                    <span className="text-olive/50 group-open:rotate-180 ml-1 transition-transform duration-200" aria-hidden>▾</span>
                  </summary>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {cautionTrails.map((trail) => (
                      <TrailCard key={trail.id} trail={trail} conditions={trailConditions[trail.id]} featured={false} />
                    ))}
                  </div>
                </details>
              )}
              {closedTrails.length > 0 && (
                <details className="group">
                  <summary className="list-none cursor-pointer flex items-center gap-2 text-sm font-medium text-olive/80 mb-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] items-center">
                    <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" aria-hidden />
                    Closed ({closedTrails.length})
                    <span className="text-olive/50 group-open:rotate-180 ml-1 transition-transform duration-200" aria-hidden>▾</span>
                  </summary>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {closedTrails.map((trail) => (
                      <TrailCard key={trail.id} trail={trail} conditions={trailConditions[trail.id]} featured={false} />
                    ))}
                  </div>
                </details>
              )}
              {unknownTrails.length > 0 && (
                <details className="group">
                  <summary className="list-none cursor-pointer flex items-center gap-2 text-sm font-medium text-olive/80 mb-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] items-center">
                    <span className="w-2 h-2 rounded-full bg-sand-300 shrink-0" aria-hidden />
                    No report ({unknownTrails.length})
                    <span className="text-olive/50 group-open:rotate-180 ml-1 transition-transform duration-200" aria-hidden>▾</span>
                  </summary>
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    {unknownTrails.map((trail) => (
                      <TrailCard key={trail.id} trail={trail} conditions={undefined} featured={false} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-olive/70">
                    <Link
                      href={`/trails/${unknownTrails[0].id}/report`}
                      className="inline-flex items-center min-h-[44px] py-2 font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
                    >
                      Report conditions
                    </Link>
                  </p>
                </details>
              )}
            </div>
          )}
        </section>

        {/* Map */}
        <section aria-labelledby="trails-map-heading" className={`${SECTION.pySub} border-t border-sand-200/80`}>
          <Disclosure id="trails-map-heading" summary={`Map (${filtered.length})`} defaultOpen>
            <div className="rounded-xl overflow-hidden border border-sand-200/80 h-[min(50vh,360px)] sm:h-[360px]">
              <AllTrailsMapClient trails={filtered} />
            </div>
          </Disclosure>
        </section>

        {/* Tips + Report CTA */}
        <section aria-labelledby="tips-heading" className={`${SECTION.pySub} border-t border-sand-200/80`}>
          <Disclosure id="tips-heading" summary="Before you go" defaultOpen={false}>
            <div className="rounded-xl bg-sand-100/80 border border-sand-200/80 p-4 sm:p-6 border-l-4 border-l-sage/50">
              <p className={`text-sm text-olive/80 ${SECTION.headingGap} break-words`}>Layers, conditions check, tell someone your route.</p>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-200/80 gap-4">
                {winterTipsHiking.slice(0, 4).map((tip) => (
                  <div key={tip.id} className="py-3 sm:py-0 sm:px-6 first:pt-0 last:pb-0 sm:first:pl-0 sm:last:pr-0">
                    <h3 className="prose-label text-olive">{tip.title}</h3>
                    <p className="text-sm text-olive/80 mt-1 leading-relaxed break-words">{tip.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-sand-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href="/plan" className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded">
                    Add to plan →
                  </Link>
                  {filtered.length > 0 && (unknownTrails[0] ?? filtered[0]) && (
                    <Link
                      href={`/trails/${(unknownTrails[0] ?? filtered[0])!.id}/report`}
                      className={`text-sm font-medium ${SECTION.aegeanLink}`}
                    >
                      Report conditions
                    </Link>
                  )}
                </div>
                <p className="text-xs text-olive/60">Build a day — add trails to your plan</p>
                <Link href="/guides/troodos-december" className={`text-sm ${SECTION.aegeanLink}`}>
                  Troodos December guide →
                </Link>
              </div>
            </div>
          </Disclosure>
        </section>

        {/* Sticky bottom CTA — mobile only */}
        {filtered.length > 0 && (
          <div
            className={`fixed left-0 right-0 z-30 flex items-center justify-center py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden ${LAYOUT.fixedBottomClearance}`}
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
