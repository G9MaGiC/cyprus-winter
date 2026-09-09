"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
// The server page localizes the list (data-layer overlay) and passes it
// down; filtering runs over the prop. Region filter keys derive from the
// prop too — region is not a localized field, so the set matches the base
// data — which keeps the EN data module out of the client bundle (same
// reasoning as cycling-route-types / nature-excursion-types).
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import HubFooter from "@/components/HubFooter";
import HubSkipNav from "@/components/HubSkipNav";
import AskAIButton from "@/components/AskAIButton";
import { HOME, LAYOUT, CTA, CARD, EMPTY_STATE, TYPE, SECTION, LAYER, STRIP, HUB } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import ListPageWidgetStrip from "@/components/ListPageWidgetStrip";
import type { WinterEvent } from "@/data/events";
import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import { Link } from "@/i18n/navigation";
import EventCard from "./EventCard";
import EventFilters from "./EventFilters";

import { orderedSeasonMonths, type SeasonMonth } from "./season-months";

export type { SeasonMonth } from "./season-months";

function monthShortKey(month: SeasonMonth) {
  return `monthShort.${month}` as const;
}

const HIGHLIGHT_IDS = ["epiphany-cyprus", "limassol-carnival"];

const EVENT_TYPES = ["festival", "market", "concert", "food", "culture", "sport"] as const;

export default function EventsPage({
  seasonAnchor = null,
  events,
}: {
  seasonAnchor?: SeasonMonth | null;
  events: WinterEvent[];
}) {
  const regionsList = useMemo(
    () =>
      Array.from(new Set(events.map((e) => e.region)))
        .filter((r) => r !== "All")
        .sort(),
    [events]
  );
  // Cold-load hash navigation: the route skeleton streams before this client
  // tree mounts, so the browser's native #anchor jump has already been lost —
  // re-run it once content is on screen (AUD A2-01 / plan→event deep links).
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? ("auto" as const)
      : ("smooth" as const);
    target.scrollIntoView({ behavior, block: "start" });
  }, []);

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
  const regionFilter = regionsList.includes(regionFromUrl) ? regionFromUrl : "";

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter && e.type !== typeFilter) return false;
      if (regionFilter && e.region !== regionFilter) return false;
      return true;
    });
  }, [events, typeFilter, regionFilter]);

  const seasonMonths = useMemo(() => orderedSeasonMonths(seasonAnchor), [seasonAnchor]);

  // "Don't miss" follows the anchored season order too — a November visitor
  // shouldn't scroll past February's carnival before Epiphany (AUD-59).
  const highlights = useMemo(
    () =>
      filtered
        .filter((e) => HIGHLIGHT_IDS.includes(e.id))
        .sort(
          (a, b) =>
            seasonMonths.indexOf(a.month as SeasonMonth) -
            seasonMonths.indexOf(b.month as SeasonMonth)
        ),
    [filtered, seasonMonths]
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

  const monthNavMonths = seasonMonths.filter((m) => byMonth[m]?.length);

  const hasInvalidFilter = Boolean((typeFromUrl && !typeFilter) || (regionFromUrl && !regionFilter));

  const typeChips = [
    { id: "", label: tPage("filters.toggleAll") },
    ...EVENT_TYPES.map((id) => ({ id, label: tPage(`types.${id}`) })),
  ];
  const regionChips = [
    { id: "", label: tPage("filters.toggleAll") },
    ...regionsList.map((r) => ({ id: r, label: r })),
  ];

  return (
    <div className="min-h-screen bg-sand">
      <HubSkipNav targets={[{ href: "#events-content", labelKey: "results" }]} />
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col ${HUB.shellGap}`}
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
          <p className="text-xs text-white/70 mt-2">{tPage("hero.updated")}</p>
        </ListPageHero>

        <ListPageWidgetStrip sticky ariaLabel={tPage("filters.aria")}>
          <EventFilters
            typeFilter={typeFilter}
            regionFilter={regionFilter}
            typeChips={typeChips}
            regionChips={regionChips}
            hasInvalidFilter={hasInvalidFilter}
          />
        </ListPageWidgetStrip>

        {filtered.length === 0 ? (
          <>
            <div
              className={EMPTY_STATE}
              role="status"
              aria-live="polite"
            >
              <p className="text-muted-ink break-words max-w-sm mx-auto">
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
                <Link href="/plan" className={CTA.primaryCompact}>
                  {tCommon("planYourTrip")}
                </Link>
                <AskAIButton className={CTA.chipTertiary} />
              </div>
            </div>
            <span id="events-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
            <HubFooter
              body={tPage("footer.hubBody")}
              ariaLabel={tPage("aria.actions")}
              askAiLabel={tDiscover("footer.askAi")}
              askAiAriaLabel={tDiscover("aria.askAi")}
            />
            <StickyPlanBarBlock sentinelId="events-plan-sentinel" />
          </>
        ) : (
          <>
            {/* Skip-nav landing point — the list region starts here whether or
                not the month nav / highlights render. */}
            <div id="events-content" className="scroll-mt-24" />
            {monthNavMonths.length > 0 && (
              <nav
                aria-label={tPage("monthNav.aria")}
                className={`sticky ${LAYOUT.stickyTop} ${LAYER.stickyContent} ${LAYOUT.stickyBarX} mt-4 py-3 sm:py-4 mb-6 sm:mb-8 ${STRIP.stickySandBar}`}
              >
                <p className={`${TYPE.kicker} text-muted-ink ${SECTION.titleGap}`}>{tPage("monthNav.title")}</p>
                <div className="flex flex-wrap gap-2">
                  {monthNavMonths.map((month) => (
                    <a
                      key={month}
                      href={`#month-${month}`}
                      className={`px-4 py-2 rounded-lg ${CTA.chipTertiary}`}
                      aria-label={tPage("monthNav.jumpTo", { month: tPage(monthShortKey(month)) })}
                    >
                      {tPage(monthShortKey(month))}
                    </a>
                  ))}
                </div>
              </nav>
            )}

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
                <p className={`text-sm text-muted-ink max-w-xl break-words ${SECTION.headingGap}`}>
                  {tPage("highlights.lead")}
                </p>
                <div className={`grid sm:grid-cols-2 ${HOME.gridGap}`}>
                  {highlights.map((e) => (
                    <EventCard key={e.id} event={e} variant="highlight" />
                  ))}
                </div>
              </section>
            )}

            <div className={SECTION.blockGap}>
              {seasonMonths.map((month) => {
                const events = byMonth[month];
                if (!events?.length) return null;
                return (
                  <section
                    key={month}
                    id={`month-${month}`}
                    className="scroll-mt-24"
                    aria-labelledby={`heading-${month}`}
                  >
                    <h2
                      id={`heading-${month}`}
                      className={`${TYPE.subSectionTitle} text-terracotta ${SECTION.titleGap}`}
                    >
                      {tPage(monthShortKey(month))}
                    </h2>
                    <p className={`text-sm text-muted-ink ${SECTION.headingGap}`}>
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
