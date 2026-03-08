"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { winterEvents } from "@/data/events";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import FilterChips from "@/components/FilterChips";
import { LAYOUT, CARD, EMPTY_STATE, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import type { WinterEvent } from "@/data/events";

const TYPE_LABELS: Record<string, string> = {
  festival: "Festival",
  market: "Market",
  concert: "Concert",
  food: "Food & Wine",
  culture: "Culture",
  sport: "Sport",
};

const TYPE_COLORS: Record<string, string> = {
  festival: "bg-golden/20 text-charcoal",
  market: "bg-terracotta/20 text-terracotta",
  concert: "bg-aegean/20 text-aegean",
  food: "bg-sage/20 text-olive",
  culture: "bg-terracotta/15 text-terracotta",
  sport: "bg-aegean/15 text-aegean",
};

const MONTH_ORDER = ["Nov", "Dec", "Jan", "Feb", "Mar"] as const;
const MONTH_FULL: Record<string, string> = {
  Nov: "November",
  Dec: "December",
  Jan: "January",
  Feb: "February",
  Mar: "March",
};

const HIGHLIGHT_IDS = ["epiphany-cyprus", "limassol-carnival"];

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
          {TYPE_LABELS[event.type] ?? event.type}
        </span>
        <span className="text-xs text-olive/60" aria-hidden>
          ·
        </span>
        <span className="text-sm text-olive/70 break-words">{event.region}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-olive break-words">
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
          aria-label={`When: ${event.dates ?? ""}. Where: ${event.venue ?? ""}`}
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
        <AddToItineraryButton placeId={event.id} label="Add to plan" />
        {event.region !== "All" && (
          <Link
            href={`/search?q=${encodeURIComponent(event.region)}`}
            className={`px-4 py-2.5 rounded-lg ${CTA.secondaryCompact}`}
          >
            Explore {event.region} →
          </Link>
        )}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2.5 rounded-lg ${CTA.chipTertiary}`}
          >
            Learn more
          </a>
        )}
      </div>
    </article>
  );
}

export default function EventsPage() {
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
  const [filtersExpanded, setFiltersExpanded] = useState(hasFilters);

  const typeChips = [
    { id: "", label: "All" },
    ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ id, label })),
  ];
  const regionChips = [
    { id: "", label: "All" },
    ...REGIONS_LIST.map((r) => ({ id: r, label: r })),
  ];

  const filterGroup = (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="prose-label text-olive/60 w-full sm:w-auto shrink-0">Type</span>
        <FilterChips
          chips={typeChips}
          isActive={(c) => (c.id === "" ? !typeFilter : typeFilter === c.id)}
          getHref={(c) => buildFilterHref(c.id, regionFilter)}
          ariaLabel="Filter by type"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="prose-label text-olive/60 w-full sm:w-auto shrink-0">Region</span>
        <FilterChips
          chips={regionChips}
          isActive={(c) => (c.id === "" ? !regionFilter : regionFilter === c.id)}
          getHref={(c) => buildFilterHref(typeFilter, c.id)}
          ariaLabel="Filter by region"
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
          title="Winter events"
          description="Epiphany, carnival, markets, tastings. The island fills the short days with light and noise. November to March."
          backHref="/"
          backLabel="Home"
          backgroundImage="/images/cyprus/cyprus-monastery-kykkos.jpg"
          backgroundImageAlt="Kykkos monastery, Troodos—Cyprus winter culture and events"
          hasWidgetStrip
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Events", href: "/events", isCurrent: true }]}
        >
          <Link
            href="/plan"
            className={`inline-flex items-center min-h-[44px] mt-4 ${CTA.tertiaryOnDark}`}
          >
            Plan your trip
          </Link>
          <p className="text-sm text-white/80 mt-2 break-words">
            Dates may shift year to year. Check official sources before you
            travel.
          </p>
        </ListPageHero>

        <StickyPlanBarBlock sentinelId="events-plan-sentinel" />

        <ListPageWidgetStrip sticky sentinelId="events-plan-sentinel" ariaLabel="Filter events">
          <section aria-label="Filter events" className="mb-0">
            <div className={`${CARD.base} ${CARD.content}`}>
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setFiltersExpanded((v) => !v)}
                  className="flex items-center justify-between w-full min-h-[44px] px-4 py-3 rounded-lg border border-sand-200/80 bg-white/80 text-left font-medium text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-expanded={filtersExpanded}
                  aria-controls="event-filters"
                  id="event-filters-toggle"
                >
                  <span className="text-sm">Filters: {hasFilters ? [typeFilter ? TYPE_LABELS[typeFilter] : null, regionFilter].filter(Boolean).join(", ") : "All"}</span>
                  <span className="text-olive/60 text-xs" aria-hidden>
                    {filtersExpanded ? "Hide" : "Show"}
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
              Nothing matches these filters. Try a different type or region.
            </p>
            <Link
              href="/events"
              className={`mt-5 inline-flex ${CTA.secondaryCompact}`}
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            {/* Month jump nav — above content, prominent */}
            {monthNavMonths.length > 0 && (
              <nav
                aria-label="Jump to month"
                className={`sticky ${LAYOUT.stickyTop} z-10 ${LAYOUT.stickyBarX} mt-4 py-3 sm:py-4 mb-6 sm:mb-8 bg-sand/95 backdrop-blur-sm border-b border-sand-200/80 supports-[backdrop-filter]:bg-sand/90`}
              >
                <p className="prose-label text-olive/60 mb-3">Jump to month</p>
                <div className="flex flex-wrap gap-2">
                  {monthNavMonths.map((month) => (
                    <a
                      key={month}
                      href={`#month-${month}`}
                      className={`px-4 py-2 rounded-lg ${CTA.chipTertiary}`}
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
                  Don&apos;t miss
                </h2>
                <p className={`text-sm text-olive/70 max-w-xl break-words ${SECTION.headingGap}`}>
                  Epiphany and Carnival are when the island shows its soul. Get
                  there early. Wrap up warm.
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
                      className={`font-display text-xl font-semibold text-terracotta ${SECTION.titleGap}`}
                    >
                      {month}
                    </h2>
                    <p className={`text-sm text-olive/60 ${SECTION.headingGap}`}>
                      {MONTH_FULL[month]}
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
                Planning tips
              </h2>
              <ul className="space-y-2 text-sm text-olive/90 break-words" role="list">
                <li className="flex gap-3">
                  <span
                    className="text-terracotta shrink-0"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span>
                    Check official sites for exact dates — many events move year
                    to year.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="text-terracotta shrink-0"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span>
                    Book early for Epiphany, Carnival, and Christmas markets.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="text-terracotta shrink-0"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span>
                    Arrive early for popular events. The best spots fill quickly.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="text-terracotta shrink-0"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span>
                    Pair events with nearby trails or villages. Hike in the
                    morning, event in the afternoon.
                  </span>
                </li>
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
