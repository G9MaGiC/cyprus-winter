"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { winterEvents } from "@/data/events";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import HubFooter from "@/components/HubFooter";
import FilterChips from "@/components/FilterChips";
import AskAIButton from "@/components/AskAIButton";
import { LAYOUT, CARD, EMPTY_STATE, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import type { WinterEvent } from "@/data/events";
import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import { Link } from "@/i18n/navigation";

const TYPE_COLORS: Record<string, string> = {
  festival: "bg-golden/20 text-charcoal",
  market: "bg-terracotta/20 text-terracotta",
  concert: "bg-aegean/20 text-aegean",
  food: "bg-sage/20 text-olive",
  culture: "bg-terracotta/15 text-terracotta",
  sport: "bg-aegean/15 text-aegean",
};

const MONTH_ORDER = ["Nov", "Dec", "Jan", "Feb", "Mar"] as const;

const HIGHLIGHT_IDS = ["epiphany-cyprus", "limassol-carnival"];

const EVENT_TYPES = ["festival", "market", "concert", "food", "culture", "sport"] as const;

const REGIONS_LIST = Array.from(new Set(winterEvents.map((e) => e.region)))
  .filter((r) => r !== "All")
  .sort();


function EventCard({
  event,
  variant = "default",
}: {
  event: WinterEvent;
  variant?: "default" | "highlight";
}) {
  const typeColor = TYPE_COLORS[event.type] ?? "bg-sand-200/80 text-olive/80";
  const tPage = useTranslations("events.page");
  const tCommon = useTranslations("common");
  const typeLabel = (type: string) => {
    const key = type as "festival" | "market" | "concert" | "food" | "culture" | "sport";
    if (key in TYPE_COLORS) return tPage(`types.${key}`);
    return type;
  };

  return (
    <article
      id={event.id}
      className={`${CARD.base} ${CARD.hover} ${CARD.content} ${
        variant === "highlight"
          ? "border-2 border-golden/40 bg-white"
          : "border-l-4 border-l-terracotta/40"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${typeColor}`}
          aria-hidden
        >
          {typeLabel(event.type)}
        </span>
        <span className="text-xs text-olive/60" aria-hidden>
          ·
        </span>
        <span className="text-sm text-olive/70 break-words">{event.region}</span>
      </div>
      <h3 className={`${TYPE.cardTitle} break-words`}>
        {event.name}
        {event.nameEl && (
          <span
            className="ml-2 text-olive/60 font-normal text-base break-words"
            lang="el"
          >
            {event.nameEl}
          </span>
        )}
      </h3>
      {(event.dates || event.venue) && (
        <p
          className="text-sm text-terracotta font-medium mt-2 break-words"
          aria-label={tPage("card.whenWhereAria", { dates: event.dates ?? "", venue: event.venue ?? "" })}
        >
          {event.dates && <span>{event.dates}</span>}
          {event.dates && event.venue && " · "}
          {event.venue && <span>{event.venue}</span>}
        </p>
      )}
      <p className="text-olive/80 text-sm mt-3 leading-relaxed break-words line-clamp-4">
        {event.description}
      </p>
      <div className="flex flex-wrap gap-3 mt-4">
        <AddToItineraryButton placeId={event.id} label={tCommon("addToPlan")} />
        {event.region !== "All" && (
          <Link
            href={`/search?q=${encodeURIComponent(event.region)}`}
            className={`px-4 py-2.5 rounded-lg ${CTA.secondaryCompact}`}
            aria-label={tPage("card.exploreRegionAria", { region: event.region })}
          >
            {tPage("card.exploreRegionCta", { region: event.region })}
          </Link>
        )}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2.5 rounded-lg ${CTA.chipTertiary}`}
            aria-label={tPage("card.learnMoreAria", { name: event.name })}
          >
            {tPage("card.learnMoreCta")}
          </a>
        )}
      </div>
    </article>
  );
}

export default function EventsPage() {
  const tNav = useTranslations("nav");
  const tEvents = useTranslations("events");
  const tPage = useTranslations("events.page");
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover");
  const tSearch = useTranslations("search");
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") ?? "";
  const regionFromUrl = searchParams.get("region") ?? "";

  const typeFilter = ["festival", "market", "concert", "food", "culture", "sport"].includes(typeFromUrl) ? typeFromUrl : "";
  const regionFilter = REGIONS_LIST.includes(regionFromUrl) ? regionFromUrl : "";

  const filtered = useMemo(() => {
    return winterEvents.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false;
      if (regionFilter && e.region !== regionFilter) return false;
      return true;
    });
  }, [typeFilter, regionFilter]);

  const highlights = useMemo(
    () => filtered.filter((e) => HIGHLIGHT_IDS.includes(e.id)),
    [filtered]
  );
  const regular = useMemo(
    () => filtered.filter((e) => !HIGHLIGHT_IDS.includes(e.id)),
    [filtered]
  );

  const byMonth = useMemo(() => {
    const acc: Record<string, WinterEvent[]> = {};
    regular.forEach((e) => {
      if (!acc[e.month]) acc[e.month] = [];
      acc[e.month].push(e);
    });
    return acc;
  }, [regular]);

  const monthNavMonths = MONTH_ORDER.filter((m) => byMonth[m]?.length);

  const buildFilterHref = (type: string, region: string) => {
    const q = new URLSearchParams();
    if (type) q.set("type", type);
    if (region) q.set("region", region);
    return q.toString() ? `/events?${q.toString()}` : "/events";
  };

  const hasFilters = Boolean(typeFilter || regionFilter);
  const hasInvalidFilter = (typeFromUrl && !typeFilter) || (regionFromUrl && !regionFilter);
  const [filtersExpanded, setFiltersExpanded] = useState(hasFilters);

  const typeChips = [
    { id: "", label: tPage("filters.toggleAll") },
    ...EVENT_TYPES.map((id) => ({ id, label: tPage(`types.${id}`) })),
  ];
  const typeFilterLabel =
    typeFilter && EVENT_TYPES.includes(typeFilter as (typeof EVENT_TYPES)[number])
      ? tPage(`types.${typeFilter as (typeof EVENT_TYPES)[number]}`)
      : null;
  const regionChips = [
    { id: "", label: tPage("filters.toggleAll") },
    ...REGIONS_LIST.map((r) => ({ id: r, label: r })),
  ];

  const filterGroup = (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${TYPE.kicker} text-olive/60 w-full sm:w-auto shrink-0`}>{tPage("filters.typeLabel")}</span>
        <FilterChips
          chips={typeChips}
          isActive={(c) => (c.id === "" ? !typeFilter : typeFilter === c.id)}
          getHref={(c) => buildFilterHref(c.id, regionFilter)}
          ariaLabel={tPage("filters.byTypeAria")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${TYPE.kicker} text-olive/60 w-full sm:w-auto shrink-0`}>{tPage("filters.regionLabel")}</span>
        <FilterChips
          chips={regionChips}
          isActive={(c) => (c.id === "" ? !regionFilter : regionFilter === c.id)}
          getHref={(c) => buildFilterHref(typeFilter, c.id)}
          ariaLabel={tPage("filters.byRegionAria")}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand">
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst}`}
      >
        <ListPageHero
          title={tPage("hero.title")}
          description={tPage("hero.description")}
          backHref="/"
          backLabel={tNav("home")}
          backgroundImage="/images/cyprus/cyprus-monastery-kykkos.jpg"
          backgroundImageAlt={tPage("hero.imageAlt")}
          hasWidgetStrip
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("events"), href: "/events", isCurrent: true }]}
        >
          <Link
            href="/plan"
            className={`inline-flex items-center min-h-[44px] mt-4 ${CTA.tertiaryOnDark}`}
            aria-label={tPage("hero.planAria")}
          >
            {tPage("hero.planCta")}
          </Link>
          <p className="text-sm text-white/80 mt-2 break-words">
            {tPage("hero.note")}
          </p>
        </ListPageHero>

        <ListPageWidgetStrip sticky ariaLabel={tPage("filters.aria")}>
          <section aria-label={tPage("filters.aria")} className="mb-0">
            <div className={`${CARD.base} ${CARD.content}`}>
              {hasInvalidFilter && (
                <p className="text-sm text-olive/70 mb-4" role="status">
                  {tPage("filters.unknown")}
                </p>
              )}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setFiltersExpanded((v) => !v)}
                  className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-expanded={filtersExpanded}
                  aria-controls="event-filters"
                  id="event-filters-toggle"
                >
                  <span className="text-sm">{tPage("filters.togglePrefix")} {hasFilters ? [typeFilterLabel, regionFilter].filter(Boolean).join(", ") : tPage("filters.toggleAll")}</span>
                  <span className="text-olive/60 text-xs" aria-hidden>
                    {filtersExpanded ? tPage("filters.toggleHide") : tPage("filters.toggleShow")}
                  </span>
                </button>
                <div
                  id="event-filters"
                  role="region"
                  aria-labelledby="event-filters-toggle"
                  hidden={!filtersExpanded}
                  className="mt-3 flex flex-col gap-4"
                >
                  {filterGroup}
                </div>
              </div>
              <div className="hidden sm:block">{filterGroup}</div>
            </div>
          </section>
        </ListPageWidgetStrip>

        {filtered.length === 0 ? (
          <div
            className={EMPTY_STATE}
            role="status"
            aria-live="polite"
          >
            <p className="text-olive/80 break-words max-w-sm mx-auto">
              {tEvents("noMatch")}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/events"
                className={CTA.secondaryCompact}
                aria-label={tEvents("clearFiltersAria")}
              >
                {tEvents("clearFilters")}
              </Link>
              <Link href="/discover" className={CTA.chipTertiary}>
                {tSearch("browseDiscover")}
              </Link>
              <Link href="/plan" className={CTA.chipTertiary}>
                {tCommon("planYourTrip")}
              </Link>
              <AskAIButton className={CTA.chipTertiary} />
            </div>
            <HubFooter
              body={tPage("footer.hubBody")}
              ariaLabel={tPage("aria.actions")}
              askAiLabel={tDiscover("footer.askAi")}
              askAiAriaLabel={tDiscover("aria.askAi")}
              className="mt-10"
            />
          </div>
        ) : (
          <>
            {/* Month jump nav — above content, prominent */}
            {monthNavMonths.length > 0 && (
              <nav
                aria-label={tPage("monthNav.aria")}
                className={`sticky ${LAYOUT.stickyTop} z-10 ${LAYOUT.stickyBarX} mt-4 py-3 sm:py-4 mb-6 sm:mb-8 bg-sand/95 backdrop-blur-sm border-b border-sand-200/80 supports-[backdrop-filter]:bg-sand/90`}
              >
                <p className={`${TYPE.kicker} text-olive/60 ${SECTION.titleGap}`}>{tPage("monthNav.title")}</p>
                <div className="flex flex-wrap gap-2">
                  {monthNavMonths.map((month) => (
                    <a
                      key={month}
                      href={`#month-${month}`}
                      className={`px-4 py-2 rounded-lg ${CTA.chipTertiary}`}
                      aria-label={tPage("monthNav.jumpTo", { month })}
                    >
                      {month}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            {/* Don&apos;t miss highlights */}
            {highlights.length > 0 && (
              <section
                aria-labelledby="dont-miss"
                className={SECTION.blockGap}
              >
                <h2
                  id="dont-miss"
                  className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}
                >
                  {tPage("highlights.title")}
                </h2>
                <p className={`text-sm text-olive/70 max-w-xl break-words ${SECTION.headingGap}`}>
                  {tPage("highlights.lead")}
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {highlights.map((e) => (
                    <EventCard key={e.id} event={e} variant="highlight" />
                  ))}
                </div>
              </section>
            )}

            {/* Events by month */}
            <div className={SECTION.blockGap}>
              {MONTH_ORDER.map((month) => {
                const events = byMonth[month];
                if (!events?.length) return null;
                return (
                  <section
                    key={month}
                    id={`month-${month}`}
                    aria-labelledby={`heading-${month}`}
                  >
                    <h2
                      id={`heading-${month}`}
                      className={`${TYPE.subSectionTitle} text-terracotta ${SECTION.titleGap}`}
                    >
                      {month}
                    </h2>
                    <p className={`text-sm text-olive/60 ${SECTION.headingGap}`}>
                      {tPage(`monthFull.${month}`)}
                    </p>
                    <ul className="space-y-6" role="list">
                      {events.map((e) => (
                        <li key={e.id}>
                          <EventCard event={e} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            {/* Planning tips */}
            <section
              className={`mt-16 sm:mt-20 ${CARD.base} ${CARD.contentLg} bg-sand-100/80 border-sand-200/70`}
              aria-labelledby="event-tips"
            >
              <h2
                id="event-tips"
                className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
              >
                {tPage("tips.title")}
              </h2>
              <ul className="space-y-2 text-sm text-olive/90 break-words" role="list">
                {(["item1", "item2", "item3", "item4"] as const).map((key) => (
                  <li key={key} className="flex gap-3">
                    <span className="text-terracotta shrink-0" aria-hidden>
                      ·
                    </span>
                    <span>{tPage(`tips.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <span id="events-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
            <HubFooter
              body={tPage("footer.hubBody")}
              ariaLabel={tPage("aria.actions")}
              askAiLabel={tDiscover("footer.askAi")}
              askAiAriaLabel={tDiscover("aria.askAi")}
              secondary={
                <AppLink href="/weather" className={SECTION.aegeanLink}>
                  {tPage("footer.weatherLink")}
                </AppLink>
              }
            />
            <StickyPlanBarBlock sentinelId="events-plan-sentinel" />
          </>
        )}
      </div>
    </div>
  );
}
