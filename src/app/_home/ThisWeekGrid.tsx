import type { ComponentType } from "react";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";
import type { LinkProps } from "@/app/_home/types";
import { winterEvents } from "@/data/events";
import { weatherByMonth } from "@/data/weather";
import { trails } from "@/data/trails";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import {
  getTrailSummary,
  type TrailSummary,
} from "@/lib/trail-summary-cache";
import { getLiveWeather, type LiveWeather } from "@/lib/weather-live";
import { getTranslations } from "next-intl/server";

const FEATURED_TRAIL_IDS = ["artemis", "caledonia-falls", "atalante", "olympus-summit"];

const MONTH_TO_WEATHER: Record<number, number> = {
  0: 2, 1: 3, 2: 4, 3: 5, 10: 0, 11: 1,
};

const MONTH_TO_EVENT_MONTH: Record<number, "Nov" | "Dec" | "Jan" | "Feb" | "Mar"> = {
  0: "Jan", 1: "Feb", 2: "Mar", 10: "Nov", 11: "Dec",
};

function getWeatherTip(): string {
  const m = new Date().getMonth();
  const idx = MONTH_TO_WEATHER[m] ?? 1;
  const w = weatherByMonth[idx];
  const first = w.troodosDesc.split(".")[0];
  return first ? `${first}.` : "Pack layers for the mountain.";
}

function getEventHighlight() {
  const m = new Date().getMonth();
  const eventMonth = MONTH_TO_EVENT_MONTH[m];
  if (!eventMonth) return null;
  const thisMonthEvents = winterEvents.filter((e) => e.month === eventMonth);
  if (thisMonthEvents.length === 0) return null;
  const event = pickDailyWithKey(thisMonthEvents, "this-week-event");
  return event;
}

function formatTrailStatus(status: string, surface: string): string {
  const s = status.charAt(0).toUpperCase() + status.slice(1);
  const surf = surface.charAt(0).toUpperCase() + surface.slice(1);
  return `${s} · ${surf}`;
}

const FETCH_TIMEOUT_MS = 4000; // Max wait to avoid blocking page

export default async function ThisWeekGrid({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const [t, tCommon] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
  ]);
  const Link = LinkComponent;
  let trailSummary: TrailSummary | null = null;
  let liveWeather: LiveWeather | null = null;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("thisweek_timeout")), FETCH_TIMEOUT_MS)
    );
    [trailSummary, liveWeather] = await Promise.race([
      Promise.all([getTrailSummary(), getLiveWeather()]),
      timeout,
    ]);
  } catch {
    trailSummary = null;
    liveWeather = null;
  }
  const w = weatherByMonth[MONTH_TO_WEATHER[new Date().getMonth()] ?? 1];
  const coastMid = liveWeather
    ? Math.round((liveWeather.coast.minC + liveWeather.coast.maxC) / 2)
    : Math.round((w.coastMinC + w.coastMaxC) / 2);
  const troodosMid = liveWeather
    ? Math.round((liveWeather.troodos.minC + liveWeather.troodos.maxC) / 2)
    : Math.round((w.troodosMinC + w.troodosMaxC) / 2);
  const tip = getWeatherTip();
  const eventHighlight = getEventHighlight();
  const trailIdsWithData = trailSummary
    ? FEATURED_TRAIL_IDS.filter((id) => trailSummary![id])
    : ["artemis"];
  const featuredTrailIds = trailIdsWithData.length > 0 ? trailIdsWithData : ["artemis"];
  const featuredTrailId = pickDailyWithKey(featuredTrailIds, "featured-trail");
  const featuredStatus = trailSummary?.[featuredTrailId];
  const featuredTrail = trails.find((tr) => tr.id === featuredTrailId);
  const trailName = featuredTrail?.name ?? "Artemis Trail";
  const trailLabel = featuredStatus
    ? formatTrailStatus(featuredStatus.status, featuredStatus.surface)
    : t("thisWeekGrid.viewTrailReports");
  const weatherTip = tip === "Pack layers for the mountain." ? t("weatherStrip.prompts.fallback") : tip;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      <Link
        href="/weather"
        prefetch="auto"
        className={`${CARD.base} ${CARD.hover} ${CARD.link} ${CARD.interactive} border-l-4 border-l-aegean rounded-xl group`}
      >
        <div className={CARD.content}>
          <p className={`${TYPE.kicker} text-sage`}>{t("thisWeekGrid.weather")}</p>
          <p className="text-2xl font-display font-bold text-charcoal mt-0.5 group-hover:text-terracotta transition-colors text-balance">
            {t("thisWeekGrid.coastTroodos", { coast: coastMid, troodos: troodosMid })}
          </p>
          <p className="text-sm text-sage mt-0.5">{weatherTip}</p>
        </div>
      </Link>

      <div
        className={`${CARD.base} ${CARD.hover} ${CARD.interactive} border-l-4 border-l-sage flex flex-col group`}
      >
        <Link href={`/trails/${featuredTrailId}`} className={`flex-1 ${CARD.link} ${CARD.content}`}>
          <p className={`${TYPE.kicker} text-sage`}>{t("thisWeekGrid.trails")}</p>
          <p className={`${TYPE.cardTitle} text-charcoal mt-0.5 truncate`} title={trailName}>
            {trailName}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-sage mt-0.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                featuredStatus?.status === "open"
                  ? "bg-aegean/70"
                  : featuredStatus?.status === "caution"
                    ? "bg-golden/70"
                    : featuredStatus?.status === "closed"
                      ? "bg-terracotta/70"
                      : "bg-sand-300"
              }`}
              aria-hidden
            />
            {trailLabel}
          </p>
        </Link>
        <div className={CARD.footer}>
          <div className="flex flex-wrap items-center gap-2">
            <AddToItineraryButton placeId={featuredTrailId} label={tCommon("addToPlan")} className="text-sm" />
            <Link
              href="/trails"
              prefetch="auto"
              className={`text-sm font-medium transition-colors ${SECTION.aegeanLink}`}
            >
              {t("thisWeekGrid.viewAllConditions")}
            </Link>
          </div>
        </div>
      </div>

      <Link
        href={eventHighlight ? `/events#${eventHighlight.id}` : "/events"}
        prefetch="auto"
        className={`${CARD.base} ${CARD.hover} ${CARD.link} ${CARD.interactive} border-l-4 border-l-golden flex flex-col group`}
      >
        <div className={CARD.content}>
          <p className={`${TYPE.kicker} text-sage`}>
            {t("thisWeekGrid.whatsOn")}
          </p>
          <p className={`${TYPE.cardTitle} text-charcoal mt-0.5 truncate`} title={eventHighlight ? eventHighlight.name : t("thisWeekGrid.events")}>
            {eventHighlight
              ? eventHighlight.name
              : winterEvents.length > 0
                ? t("thisWeekGrid.browseWinterEvents")
                : t("thisWeekGrid.events")}
          </p>
          <p className="text-sm text-sage mt-0.5 line-clamp-2 break-words">
            {eventHighlight
              ? eventHighlight.dates ?? eventHighlight.venue ?? ""
              : winterEvents.length > 0
                ? winterEvents.slice(0, 2).map((e) => e.name).join(" · ") + "…"
                : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}

