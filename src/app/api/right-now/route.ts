import { scoreAndRank, assignDiscoveryBadges } from "@/lib/right-now-scoring";
import { getWeatherAtCoords } from "@/lib/weather-live";
import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { getAttractionById, getRestaurantById } from "@/data";
import { trails } from "@/data/trails";
import { winterEvents } from "@/data/events";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { rateLimitSuccessHeaders } from "@/lib/api-response";

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
    if (att?.description) return att.description.split(".")[0] + "." || "Worth a visit.";
    const rest = getRestaurantById(place.id);
    if (rest?.description) return rest.description.split(".")[0] + "." || "Worth a visit.";
    const ev = winterEvents.find((x) => x.id === place.id);
    if (ev?.description) return ev.description.split(".")[0] + "." || "Worth a visit.";
  } catch {
    // fallback on any parse error
  }
  return "Worth a visit.";
}

export async function GET(req: Request) {
  let limitResult: RateLimitResult = { ok: true, remaining: RIGHT_NOW_LIMIT, resetAt: Date.now() + 60000, bypassed: true };
  try {
    limitResult = await rateLimit(req, RIGHT_NOW_LIMIT, "right-now");
  } catch {
    // Fail open: allow request if rate limiting errors
  }
  if (!limitResult.ok) {
    return Response.json(
      { error: { code: "RATE_LIMITED" as const, message: "Too many requests. Try again in a minute." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const limitParam = searchParams.get("limit");
  const maxDistanceParam = searchParams.get("maxDistance");
  const limit = Math.min(DEFAULT_ITEM_LIMIT, Math.max(1, parseInt(limitParam ?? "", 10) || DEFAULT_ITEM_LIMIT));
  const maxDistanceKm = maxDistanceParam != null ? parseFloat(maxDistanceParam) : null;

  const lat = latParam != null ? parseFloat(latParam) : NaN;
  const lng = lngParam != null ? parseFloat(lngParam) : NaN;

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR" as const, message: "lat and lng are required and must be valid" } },
      { status: 400 }
    );
  }

  try {
    const weather = await getWeatherAtCoords(lat, lng);
    const fetchLimit = maxDistanceKm != null ? Math.min(limit * 3, DEFAULT_ITEM_LIMIT) : limit;
    let scored = scoreAndRank(lat, lng, weather, fetchLimit);
    if (maxDistanceKm != null && !Number.isNaN(maxDistanceKm) && maxDistanceKm > 0) {
      scored = scored.filter((item) => item.distanceKm <= maxDistanceKm).slice(0, limit);
    }
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
    console.error("Right Now API error:", err);
    return Response.json(
      { error: { code: "INTERNAL_ERROR" as const, message: "Could not load suggestions" } },
      { status: 500 }
    );
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
