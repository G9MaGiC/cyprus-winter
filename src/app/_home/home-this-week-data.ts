import "server-only";

import { winterEvents } from "@/data/events";
import { trails } from "@/data/trails";
import { getTrailImage } from "@/lib/cyprus-images";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { getLocalizedName } from "@/lib/localize";
import { getWeatherPromptKey, getWeatherRowForCurrentMonth } from "@/lib/home-weather-month";
import { getTrailSummary, type TrailSummary } from "@/lib/trail-summary-cache";
import { getLiveWeather, type LiveWeather } from "@/lib/weather-live";
import { getTranslations } from "next-intl/server";
import type { HomeThisWeekGridViewProps } from "@/app/_home/HomeThisWeekGridView";

const FEATURED_TRAIL_IDS = ["artemis", "caledonia-falls", "atalante", "olympus-summit"];
const MONTH_TO_EVENT_MONTH: Record<number, "Nov" | "Dec" | "Jan" | "Feb" | "Mar"> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  10: "Nov",
  11: "Dec",
};
const FETCH_TIMEOUT_MS = 4000;

type TrailStatus = "open" | "caution" | "closed";
type TrailSurface = "dry" | "muddy" | "snow" | "icy";

function getEventHighlight() {
  const m = new Date().getMonth();
  const eventMonth = MONTH_TO_EVENT_MONTH[m];
  if (!eventMonth) return null;
  const thisMonthEvents = winterEvents.filter((e) => e.month === eventMonth);
  if (thisMonthEvents.length === 0) return null;
  return pickDailyWithKey(thisMonthEvents, "this-week-event");
}

function formatTrailStatus(
  status: string,
  surface: string,
  tTrails: (key: string) => string
): string {
  const statusKey = status as TrailStatus;
  const surfaceKey = surface as TrailSurface;
  const statusLabels: Record<TrailStatus, string> = {
    open: tTrails("report.options.status.open.label"),
    caution: tTrails("report.options.status.caution.label"),
    closed: tTrails("report.options.status.closed.label"),
  };
  const surfaceLabels: Record<TrailSurface, string> = {
    dry: tTrails("report.options.surface.dry.label"),
    muddy: tTrails("report.options.surface.muddy.label"),
    snow: tTrails("report.options.surface.snow.label"),
    icy: tTrails("report.options.surface.icy.label"),
  };
  const statusLabel = statusLabels[statusKey] ?? status;
  const surfaceLabel = surfaceLabels[surfaceKey] ?? surface;
  return `${statusLabel} · ${surfaceLabel}`;
}

export async function getHomeThisWeekGridProps(locale?: string): Promise<HomeThisWeekGridViewProps> {
  const resolvedLocale = locale ?? "en";
  const [t, tCommon, tTrails] = await Promise.all([
    locale ? getTranslations({ locale, namespace: "home" }) : getTranslations("home"),
    locale ? getTranslations({ locale, namespace: "common" }) : getTranslations("common"),
    locale
      ? getTranslations({ locale, namespace: "trails" })
      : getTranslations("trails"),
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

  const w = getWeatherRowForCurrentMonth();
  const coastMid = liveWeather
    ? Math.round((liveWeather.coast.minC + liveWeather.coast.maxC) / 2)
    : Math.round((w.coastMinC + w.coastMaxC) / 2);
  const troodosMid = liveWeather
    ? Math.round((liveWeather.troodos.minC + liveWeather.troodos.maxC) / 2)
    : Math.round((w.troodosMinC + w.troodosMaxC) / 2);

  const weatherTip = t(`weatherStrip.prompts.${getWeatherPromptKey(w)}`);
  const eventHighlight = getEventHighlight();
  const trailIdsWithData = trailSummary
    ? FEATURED_TRAIL_IDS.filter((id) => trailSummary[id])
    : ["artemis"];
  const featuredTrailIds = trailIdsWithData.length > 0 ? trailIdsWithData : ["artemis"];
  const featuredTrailId = pickDailyWithKey(featuredTrailIds, "featured-trail");
  const featuredStatus = trailSummary?.[featuredTrailId];
  const featuredTrail = trails.find((tr) => tr.id === featuredTrailId);
  const trailName = featuredTrail
    ? getLocalizedName(featuredTrail, resolvedLocale)
    : t("editorsPicks.items.artemis.title");
  const trailLabel = featuredStatus
    ? formatTrailStatus(featuredStatus.status, featuredStatus.surface, tTrails)
    : t("thisWeekGrid.viewTrailReports");

  const eventTitle = eventHighlight
    ? getLocalizedName(eventHighlight, resolvedLocale)
    : winterEvents.length > 0
      ? t("thisWeekGrid.browseWinterEvents")
      : t("thisWeekGrid.events");
  const eventSubtitle = eventHighlight
    ? eventHighlight.dates ?? eventHighlight.venue ?? ""
    : winterEvents.length > 0
      ? t("thisWeekGrid.eventsTeaser")
      : "";

  return {
    weatherKicker: t("thisWeekGrid.weather"),
    weatherHeading: t("thisWeekGrid.coastTroodos", { coast: coastMid, troodos: troodosMid }),
    weatherTip,
    trailsKicker: t("thisWeekGrid.trails"),
    trailName,
    trailLabel,
    trailHref: `/trails/${featuredTrailId}`,
    trailImage: getTrailImage(featuredTrailId),
    trailImageAlt: t("thisWeekGrid.trailPhotoAlt", { name: trailName }),
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
