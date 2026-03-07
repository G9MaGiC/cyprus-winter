"use client";

import { useMemo, useState, useId } from "react";
import Link from "next/link";
import { winterEvents } from "@/data/events";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { LAYOUT, CARD, EMPTY_STATE, CTA } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
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
      className={`${CARD.base} ${CARD.hover} ${CARD.content} border-l-4 ${
        variant === "highlight"
          ? "border-golden/50 border-l-golden/50 bg-white"
          : "border-l-terracotta/40"
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
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const typeLabelId = useId();
  const regionLabelId = useId();

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

  const regions = useMemo(
    () =>
      Array.from(new Set(winterEvents.map((e) => e.region)))
        .filter((r) => r !== "All")
        .sort(),
    []
  );

  const monthNavMonths = MONTH_ORDER.filter((m) => byMonth[m]?.length);

  return (
    <div className="min-h-screen bg-sand">
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      >
        <ListPageHero
          title="Winter events"
          description="Epiphany, carnival, markets, tastings. The island fills the short days with light and noise. November to March."
          backHref="/"
          backLabel="Home"
          backgroundImage="/images/cyprus/cyprus-monastery-kykkos.jpg"
          backgroundImageAlt="Kykkos monastery, Troodos—Cyprus winter culture and events"
        >
          <div className="mt-4">
            <Link
              href="/plan"
              className={`px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}
            >
              Plan your trip
            </Link>
          </div>
          <p className="text-sm text-olive/60 mt-2 break-words">
            Dates may shift year to year. Check official sources before you
            travel.
          </p>
        </ListPageHero>

        <div className="mt-4 relative">
          <div id="events-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        </div>
        <StickyPlanBarBlock sentinelId="events-plan-sentinel" />

        {/* Filters — collapsible on mobile, single row on lg */}
        <section
          aria-label="Filter events"
          className="mb-10 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 lg:gap-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span
                id={typeLabelId}
                className="prose-label text-olive/60 w-full sm:w-auto shrink-0"
              >
                Type
              </span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby={typeLabelId}
              >
                <button
                  type="button"
                  onClick={() => setTypeFilter("")}
                  aria-pressed={!typeFilter}
                  className={!typeFilter ? CTA.chipPrimary : CTA.chipSecondary}
                >
                  All
                </button>
                {Object.entries(TYPE_LABELS).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTypeFilter(typeFilter === id ? "" : id)}
                    aria-pressed={typeFilter === id}
                    className={typeFilter === id ? CTA.chipPrimary : CTA.chipSecondary}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span
                id={regionLabelId}
                className="prose-label text-olive/60 w-full sm:w-auto shrink-0"
              >
                Region
              </span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby={regionLabelId}
              >
                <button
                  type="button"
                  onClick={() => setRegionFilter("")}
                  aria-pressed={!regionFilter}
                  className={!regionFilter ? CTA.chipPrimary : CTA.chipSecondary}
                >
                  All
                </button>
                {regions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      setRegionFilter(regionFilter === r ? "" : r)
                    }
                    aria-pressed={regionFilter === r}
                    className={regionFilter === r ? CTA.chipPrimary : CTA.chipSecondary}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {filtered.length === 0 ? (
          <div
            className={EMPTY_STATE}
            role="status"
            aria-live="polite"
          >
            <p className="text-olive/80 break-words max-w-sm mx-auto">
              Nothing matches these filters. Try a different type or region.
            </p>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("");
                setRegionFilter("");
              }}
              className={`mt-5 px-5 py-3 rounded-lg ${CTA.secondaryCompact}`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Month jump nav — above content, prominent */}
            {monthNavMonths.length > 0 && (
              <nav
                aria-label="Jump to month"
                className={`sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 ${LAYOUT.stickyBarX} py-3 mb-8 -mt-2 bg-sand/95 backdrop-blur-sm border-b border-sand-200/80`}
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
                className="mb-12 sm:mb-16"
              >
                <h2
                  id="dont-miss"
                  className="font-display text-xl font-semibold text-olive mb-3 sm:mb-4"
                >
                  Don&apos;t miss
                </h2>
                <p className="text-sm text-olive/70 mb-6 max-w-xl break-words">
                  Epiphany and Carnival are when the island shows its soul. Get
                  there early. Wrap up warm.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {highlights.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl overflow-hidden border border-golden/30 bg-white shadow-sm"
                    >
                      <EventCard event={e} variant="highlight" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Events by month */}
            <div className="space-y-12">
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
                      className="font-display text-xl font-semibold text-terracotta mb-1"
                    >
                      {month}
                    </h2>
                    <p className="text-sm text-olive/60 mb-5">
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
              className={`mt-12 sm:mt-16 ${CARD.base} ${CARD.contentLg} bg-sand-100/80 border-sand-200/70`}
              aria-labelledby="event-tips"
            >
              <h2
                id="event-tips"
                className="font-display font-semibold text-olive mb-4"
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
