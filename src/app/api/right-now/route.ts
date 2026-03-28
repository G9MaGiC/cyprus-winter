import { scoreAndRank, assignDiscoveryBadges } from "@/lib/right-now-scoring";
import { getWeatherAtCoords } from "@/lib/weather-live";
import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { getAttractionById, getRestaurantById } from "@/data";
import { trails } from "@/data/trails";
import { winterEvents } from "@/data/events";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import {
  jsonError,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
} from "@/lib/api-response";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const RIGHT_NOW_LIMIT = 30;
const DEFAULT_ITEM_LIMIT = 12;

function getHref(place: { id: string; type: string }): string {
  if (place.type === "trail") return `/trails/${place.id}`;
  if (place.type === "event") return "/events";
  return `/discover/${place.id}`;
}

function getImage(place: { id: string; type: string }): string {
  if (place.type === "trail") return getTrailImage(place.id);
  const att = getAttractionById(place.id);
  if (att) return getAttractionImage(place.id, att.type);
  const rest = getRestaurantById(place.id);
  return getAttractionImage(place.id, rest ? "restaurant" : "nature");
}

function getTease(place: { id: string; type: string; localSecret?: string; winterTip?: string }): string {
  try {
    if (place.localSecret) return place.localSecret;
    if (place.winterTip) return place.winterTip;
    if (place.type === "trail") {
      const t = trails.find((x) => x.id === place.id);
      if (!t) return "Worth a visit.";
      const desc = t.winterNotes ?? (typeof t.description === "string" ? t.description.split(".")[0] + "." : "Worth a visit.");
      return desc || "Worth a visit.";
    }
    const att = getAttractionById(place.id);
    if (att?.description) { const s = att.description.split(".")[0]?.trim(); if (s) return `${s}.`; }
    const rest = getRestaurantById(place.id);
    if (rest?.description) { const s = rest.description.split(".")[0]?.trim(); if (s) return `${s}.`; }
    const ev = winterEvents.find((x) => x.id === place.id);
    if (ev?.description) { const s = ev.description.split(".")[0]?.trim(); if (s) return `${s}.`; }
  } catch {
    // fallback on any parse error
  }
  return "Worth a visit.";
}

export async function GET(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, RIGHT_NOW_LIMIT, "right-now");
  } catch {
    return jsonError(
      "SERVICE_UNAVAILABLE",
      "Rate limiting unavailable. Try again in a moment.",
      503
    );
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Too many requests. Try again in a minute.",
      limitResult.resetAt
    );
  }

  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const limitParam = searchParams.get("limit");
  const maxDistanceParam = searchParams.get("maxDistance");
  const regionParam = searchParams.get("region");
  const rawLimit = parseInt(limitParam ?? "", 10);
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_ITEM_LIMIT : Math.min(rawLimit, DEFAULT_ITEM_LIMIT);
  const maxDistanceKm =
    maxDistanceParam != null && !Number.isNaN(parseFloat(maxDistanceParam))
      ? parseFloat(maxDistanceParam)
      : null;
  const region =
    regionParam && ["troodos", "paphos", "ayia-napa", "larnaca", "limassol"].includes(regionParam)
      ? (regionParam as "troodos" | "paphos" | "ayia-napa" | "larnaca" | "limassol")
      : null;

  const lat = latParam != null ? parseFloat(latParam) : NaN;
  const lng = lngParam != null ? parseFloat(lngParam) : NaN;

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return jsonError(
      "VALIDATION_ERROR",
      "lat and lng are required and must be valid",
      400
    );
  }

  try {
    const weather = await getWeatherAtCoords(lat, lng);
    const fetchLimit = Math.min(Math.max(limit * 3, 12), DEFAULT_ITEM_LIMIT);
    let scored = scoreAndRank(lat, lng, weather, fetchLimit, region);
    if (maxDistanceKm != null && !Number.isNaN(maxDistanceKm) && maxDistanceKm > 0) {
      scored = scored.filter((item) => item.distanceKm <= maxDistanceKm);
    }
    scored = scored.slice(0, limit);
    const withBadges = assignDiscoveryBadges(scored, weather);

    const timeUsed = new Date().toISOString();

    const items = withBadges.map((item) => {
      const tease = getTease(item);
      return {
        id: item.id,
        name: item.name,
        region: item.region,
        type: item.type,
        href: getHref(item),
        score: item.score,
        reasons: buildReasons(item),
        distanceKm: item.distanceKm,
        timeOfDayMatch: item.timeOfDayMatch,
        discoveryBadge: item.discoveryBadge,
        image: getImage(item),
        tease: tease.length > 120 ? tease.slice(0, 120) + "…" : tease,
      };
    });

    return Response.json(
      {
        items,
        meta: { locationUsed: true, timeUsed },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
          ...rateLimitSuccessHeaders(limitResult.remaining, RIGHT_NOW_LIMIT, limitResult.bypassed),
        },
      }
    );
  } catch (err) {
    logger.error("Right Now API error", err);
    return jsonError("SERVER_ERROR", "Could not load suggestions", 500);
  }
}

function buildReasons(item: {
  discoveryBadge: string | null;
  distanceKm: number;
  localSecret?: string;
}): string[] {
  const reasons: string[] = [];
  if (item.discoveryBadge) reasons.push(item.discoveryBadge);
  if (item.distanceKm < 15) reasons.push("Nearby");
  if (item.localSecret) reasons.push("Local secret");
  return reasons.length > 0 ? reasons : ["Worth a visit"];
}
