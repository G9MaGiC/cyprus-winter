"use client";

import AppLink from "@/components/AppLink";
import { useEffect } from "react";
import { trailConditions } from "@/data/trails";
import { LAYER, LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
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
import { useTranslations } from "next-intl";
import { SRStatus } from "@/components/SRStatus";

export default function TrailsClient() {
  const tNav = useTranslations("nav");
  const tTrailsPage = useTranslations("trails.page");
  const tCommon = useTranslations("common");
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

  const hasAnyTrails = filtered.length > 0;

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
    ? tTrailsPage("sr.filtered", { count: filtered.length })
    : tTrailsPage("sr.allByCategory");

  return (
    <div className="min-h-screen bg-sand">
      <SRStatus message={filterAnnouncement} />
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16`}
      >
        <ListPageHero
          title={tTrailsPage("hero.title")}
          description={tTrailsPage("hero.description")}
          descriptionSecondary={tTrailsPage("hero.descriptionSecondary", {
            open: counts.open,
            caution: counts.caution,
          })}
          backHref="/"
          backLabel={tNav("home")}
          backgroundImage="/images/cyprus/cyprus-trail-troodos.jpg"
          backgroundImageAlt={tTrailsPage("hero.imageAlt")}
          breadcrumbItems={[
            { label: tNav("home"), href: "/" },
            { label: tNav("trails"), href: "/trails", isCurrent: true },
          ]}
        >
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
            <AppLink
              href="/plan"
              className={CTA.tertiaryOnDark}
              aria-label={tCommon("aria.planCta")}
            >
              {tCommon("planYourTrip")}
            </AppLink>
            <AppLink
              href="/weather"
              className={CTA.ghost}
              aria-label={tTrailsPage("hero.weatherAria")}
            >
              {tNav("weather")}
            </AppLink>
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
              {tTrailsPage("search.heading")}
            </h2>
            <SearchBar
              placeholder={tTrailsPage("search.placeholder")}
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>

        <TrailsConditionsStrip
          openCount={counts.open}
          cautionCount={counts.caution}
          closedCount={counts.closed}
        />

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
                {tTrailsPage("list.filteredHeading", { count: filtered.length })}
              </h2>
              <AppLink href="/trails" className={`text-sm font-medium shrink-0 ${SECTION.aegeanLink}`}>
                {tCommon("clearFilters")}
              </AppLink>
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
                  label={tTrailsPage("groups.open")}
                  trails={openTrails}
                  dotColor="bg-aegean"
                  defaultOpen
                />
                <TrailStatusGroup
                  label={tTrailsPage("groups.caution")}
                  trails={cautionTrails}
                  dotColor="bg-golden"
                  defaultOpen={cautionTrails.length <= 4}
                />
                <TrailStatusGroup
                  label={tTrailsPage("groups.closed")}
                  trails={closedTrails}
                  dotColor="bg-terracotta"
                />
                <TrailStatusGroup
                  label={tTrailsPage("groups.noReport")}
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
            {tTrailsPage("map.heading", { count: filtered.length })}
          </h2>
          <p className="text-xs text-olive/60 -mt-2 mb-3">
            {tTrailsPage("map.caption")}
          </p>
          <div className="rounded-xl overflow-hidden border border-sand-200/80 h-[min(50vh,360px)] sm:h-[360px]">
            <AllTrailsMapClient trails={filtered} />
          </div>
        </section>

        <TrailsTipsSection reportTrail={reportTrail} />

        <TrailsFooter reportTrailId={reportTrail?.id} onScrollToMap={scrollToMap} />

        {hasAnyTrails && (
          <div
            className={`fixed left-0 right-0 ${LAYOUT.fixedBottomAboveNavCookie} ${LAYER.stickyPlaceBar} flex items-center justify-center py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 ${LAYOUT.mobileBottomChromeHidden}`}
          >
            <AppLink
              href="/plan"
              className={`flex-1 max-w-sm flex justify-center items-center min-h-[48px] px-6 rounded-xl ${CTA.primaryCompact}`}
              aria-label={tTrailsPage("bottomBar.aria")}
            >
              {tCommon("addToPlan")}
            </AppLink>
          </div>
        )}
      </div>
    </div>
  );
}
