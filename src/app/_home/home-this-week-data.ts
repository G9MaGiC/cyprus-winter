import "server-only";

import { winterEvents } from "@/data/events";
import { weatherByMonth } from "@/data/weather";
import { trails } from "@/data/trails";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { getTrailSummary, type TrailSummary } from "@/lib/trail-summary-cache";
import { getLiveWeather, type LiveWeather } from "@/lib/weather-live";
import { getTranslations } from "next-intl/server";
import type { HomeThisWeekGridViewProps } from "@/app/_home/HomeThisWeekGridView";

const FEATURED_TRAIL_IDS = ["artemis", "caledonia-falls", "atalante", "olympus-summit"];
const MONTH_TO_WEATHER: Record<number, number> = { 0: 2, 1: 3, 2: 4, 3: 5, 10: 0, 11: 1 };
const MONTH_TO_EVENT_MONTH: Record<number, "Nov" | "Dec" | "Jan" | "Feb" | "Mar"> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  10: "Nov",
  11: "Dec",
};
const FETCH_TIMEOUT_MS = 4000;

function getWeatherTip(): string {
  const m = new Date().getMonth();
  const w = weatherByMonth[MONTH_TO_WEATHER[m] ?? 1];
  const first = w.troodosDesc.split(".")[0];
  return first ? `${first}.` : "Pack layers for the mountain.";
}

function getEventHighlight() {
  const m = new Date().getMonth();
  const eventMonth = MONTH_TO_EVENT_MONTH[m];
  if (!eventMonth) return null;
  const thisMonthEvents = winterEvents.filter((e) => e.month === eventMonth);
  if (thisMonthEvents.length === 0) return null;
  return pickDailyWithKey(thisMonthEvents, "this-week-event");
}

function formatTrailStatus(status: string, surface: string): string {
  const s = status.charAt(0).toUpperCase() + status.slice(1);
  const surf = surface.charAt(0).toUpperCase() + surface.slice(1);
  return `${s} · ${surf}`;
}

export async function getHomeThisWeekGridProps(locale?: string): Promise<HomeThisWeekGridViewProps> {
  const [t, tCommon] = await Promise.all([
    locale ? getTranslations({ locale, namespace: "home" }) : getTranslations("home"),
    locale ? getTranslations({ locale, namespace: "common" }) : getTranslations("common"),
  ]);

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
    ? FEATURED_TRAIL_IDS.filter((id) => trailSummary[id])
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

  const eventTitle = eventHighlight
    ? eventHighlight.name
    : winterEvents.length > 0
      ? t("thisWeekGrid.browseWinterEvents")
      : t("thisWeekGrid.events");
  const eventSubtitle = eventHighlight
    ? eventHighlight.dates ?? eventHighlight.venue ?? ""
    : winterEvents.length > 0
      ? winterEvents.slice(0, 2).map((e) => e.name).join(" · ") + "…"
      : "";

  return {
    weatherKicker: t("thisWeekGrid.weather"),
    weatherHeading: t("thisWeekGrid.coastTroodos", { coast: coastMid, troodos: troodosMid }),
    weatherTip,
    trailsKicker: t("thisWeekGrid.trails"),
    trailName,
    trailLabel,
    trailHref: `/trails/${featuredTrailId}`,
    trailStatus: featuredStatus?.status ?? null,
    addToPlanLabel: tCommon("addToPlan"),
    featuredTrailId,
    viewAllConditionsLabel: t("thisWeekGrid.viewAllConditions"),
    eventsKicker: t("thisWeekGrid.whatsOn"),
    eventTitle,
    eventSubtitle,
    eventHref: eventHighlight ? `/events#${eventHighlight.id}` : "/events",
  };
}
