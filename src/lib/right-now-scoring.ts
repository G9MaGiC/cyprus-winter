import type { PlanItem } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { itemMatchesRegion, type RegionSlug } from "@/data/regions";
import { getTimeBucket, getPlaceTimeSignals, matchesTimeBucket, isAdjacentBucket, type TimeBucket } from "@/lib/right-now-buckets";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { getPlaceOfDayIds } from "@/lib/place-of-day-ids";
import type { WeatherAtCoords } from "@/lib/weather-live";
import { allPlaces } from "@/data";
import { getAttractionById, getRestaurantById } from "@/data";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { winterEvents } from "@/data/events";

/**
 * Right Now scoring — ranks places by live circumstances and curation.
 * Signals: distance (nearby first), weather (type match), time-of-day, liveness,
 * place-of-day (home + discover featured picks).
 */

/** Input for scoring: place + resolved entity fields */
export type ScorablePlace = PlanItem & {
  bestTimeToVisit?: string;
  openingHours?: string;
  winterTip?: string;
  localSecret?: string;
  winterOpen?: boolean;
  /** For attractions, the actual subtype (beach, ancient, village, etc.); otherwise same as type */
  effectiveType?: string;
};

export type DiscoveryBadge =
  | "Hidden gem near you"
  | "Only locals know this spot"
  | "Trending today"
  | "Perfect for sunset today";

/** Haversine distance in km */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Distance score: exponential decay so very close places get stronger boost. 1/(1 + km/20) for smooth falloff. */
function distanceScore(km: number): number {
  return 1 / (1 + km / 20);
}

/** Time match: 1 match, 0.5 adjacent, 0.2 otherwise */
function timeMatchScore(
  preferredBuckets: TimeBucket[],
  current: TimeBucket
): number {
  if (matchesTimeBucket(preferredBuckets, current)) return 1;
  if (preferredBuckets.some((b) => isAdjacentBucket(b, current))) return 0.5;
  return 0.2;
}

/** Weather match: rain→indoor; clear→outdoor; cold→wineries/restaurants */
function weatherMatchScore(
  placeType: string,
  weather: WeatherAtCoords | null
): number {
  if (!weather) return 0.7;
  const rain = weather.precipitationMm > 1;
  const cold = weather.maxC < 12;
  const indoor = ["winery", "restaurant", "village", "monastery", "ancient"].includes(placeType);
  const outdoor = ["beach", "trail", "nature"].includes(placeType);
  if (rain && indoor) return 1;
  if (rain && outdoor) return 0.3;
  if (!rain && outdoor) return 0.95;
  if (cold && (placeType === "winery" || placeType === "restaurant")) return 0.95;
  return 0.7;
}

/** Liveness: localSecret + winterOpen + small boost */
function livenessScore(place: ScorablePlace): number {
  let s = 0.5;
  if (place.localSecret) s += 0.2;
  if (place.winterOpen) s += 0.15;
  return Math.min(1, s);
}

/** Place-of-day boost: curated picks from home and discover get a lift when nearby */
const PLACE_OF_DAY_BOOST = 0.15;

function placeOfDayScore(placeId: string, placeOfDayIds: Set<string>): number {
  return placeOfDayIds.has(placeId) ? PLACE_OF_DAY_BOOST : 0;
}

/** Enrich PlanItem with entity fields for scoring */
function enrichPlace(place: PlanItem): ScorablePlace {
  const base: ScorablePlace = { ...place };
  if (place.type === "trail") {
    base.effectiveType = place.type;
    const t = trails.find((x) => x.id === place.id);
    if (t) {
      base.bestTimeToVisit = t.winterNotes;
      base.localSecret = t.localSecret;
    }
  } else if (place.type === "winery") {
    base.effectiveType = place.type;
    const w = wineries.find((x) => x.id === place.id);
    if (w) {
      base.bestTimeToVisit = w.bestTimeToVisit;
      base.openingHours = w.openingHours;
      base.winterTip = w.winterTip;
      base.localSecret = w.localSecret;
      base.winterOpen = w.winterOpen;
    }
  } else if (place.type === "restaurant") {
    base.effectiveType = place.type;
    const r = getRestaurantById(place.id);
    if (r) {
      base.bestTimeToVisit = r.bestTimeToVisit;
      base.openingHours = r.openingHours;
      base.winterTip = r.winterTip;
      base.localSecret = r.localSecret;
      base.winterOpen = r.winterOpen;
    }
  } else if (place.type === "attraction" || place.type === "activity") {
    const a = getAttractionById(place.id);
    if (a) {
      base.effectiveType = a.type;
      base.bestTimeToVisit = a.bestTimeToVisit;
      base.openingHours = a.openingHours;
      base.winterTip = a.winterTip;
      base.localSecret = a.localSecret;
    } else {
      base.effectiveType = place.type;
    }
  } else if (place.type === "event") {
    base.effectiveType = place.type;
    const e = winterEvents.find((x) => x.id === place.id);
    if (e) base.bestTimeToVisit = e.dates;
  }
  return base;
}

/** All place types for Right Now (exclude event if we want; events are time-bound) */
const ELIGIBLE_TYPES = ["attraction", "trail", "winery", "restaurant", "event"] as const;

export type ScoredPlace = ScorablePlace & {
  score: number;
  distanceKm: number;
  timeOfDayMatch: TimeBucket;
  preferredBuckets: TimeBucket[];
  coords: { lat: number; lng: number } | null;
};

/**
 * Score and rank all eligible places.
 * Signals: distance, weather, time-of-day, liveness, place-of-day.
 * When region is provided (region-picker mode), only places in that region are considered.
 */
export function scoreAndRank(
  userLat: number,
  userLng: number,
  weather: WeatherAtCoords | null,
  limit = 12,
  region: RegionSlug | null = null
): ScoredPlace[] {
  const currentBucket = getTimeBucket();
  const placeOfDayIds = getPlaceOfDayIds();
  let places = allPlaces.filter((p) =>
    ELIGIBLE_TYPES.includes(p.type as (typeof ELIGIBLE_TYPES)[number])
  );
  if (region) {
    places = places.filter((p) => itemMatchesRegion(p.region, region));
  }
  const enriched = places.map(enrichPlace);
  const withCoords = enriched
    .map((p) => {
      const coords = getPlaceCoords(p);
      if (!coords) return null;
      const km = haversineKm(userLat, userLng, coords.lat, coords.lng);
      const preferredBuckets = getPlaceTimeSignals(
        p.bestTimeToVisit ?? p.winterTip ?? p.openingHours,
        p.effectiveType ?? p.type
      );
      const timeScore = timeMatchScore(preferredBuckets, currentBucket);
      const distScore = distanceScore(km);
      const weatherScore = weatherMatchScore(p.effectiveType ?? p.type, weather);
      const liveScore = livenessScore(p);
      const placeOfDay = placeOfDayScore(p.id, placeOfDayIds);
      const score =
        0.23 * timeScore + 0.28 * distScore + 0.23 * weatherScore + 0.18 * liveScore + placeOfDay;
      return {
        ...p,
        score,
        distanceKm: Math.round(km * 10) / 10,
        timeOfDayMatch: currentBucket,
        preferredBuckets,
        coords,
      } as ScoredPlace;
    })
    .filter((x): x is ScoredPlace => x != null);
  // Sort by distance first (nearest = "near you"), then by composite score as tiebreaker
  withCoords.sort((a, b) => {
    const d = a.distanceKm - b.distanceKm;
    if (Math.abs(d) > 0.5) return d;
    return b.score - a.score;
  });

  // Diversify: avoid showing 4 of the same type. Max 1 per type for first 4 slots, then 2 per type for rest.
  const maxPerTypeFirst = 1;
  const maxPerTypeRest = 2;
  const picked: ScoredPlace[] = [];
  const typeCounts: Record<string, number> = {};
  for (const p of withCoords) {
    if (picked.length >= limit) break;
    const t = p.type;
    const count = typeCounts[t] ?? 0;
    const cap = picked.length < 4 ? maxPerTypeFirst : maxPerTypeRest;
    if (count < cap) {
      picked.push(p);
      typeCounts[t] = count + 1;
    }
  }
  // Fill remaining slots with next-best by score if we didn't hit limit (e.g. only 2 restaurant types exist)
  for (const p of withCoords) {
    if (picked.length >= limit) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked.slice(0, limit);
}

/**
 * Assign discovery badge to each item. At most one "Trending today" per day.
 */
export function assignDiscoveryBadges(
  items: ScoredPlace[],
  weather?: WeatherAtCoords | null
): (ScoredPlace & { discoveryBadge: DiscoveryBadge | null })[] {
  const current = getTimeBucket();
  const clearWeather = !weather || weather.precipitationMm < 1;
  const trendingId = items.length > 0
    ? pickDailyWithKey(items, "right-now-trending").id
    : null;

  return items.map((item) => {
    if (item.id === trendingId) return { ...item, discoveryBadge: "Trending today" as const };
    const effectiveType = item.effectiveType ?? item.type;
    if (current === "sunset" && clearWeather && ["beach", "restaurant", "ancient", "village", "nature"].includes(effectiveType)) {
      return { ...item, discoveryBadge: "Perfect for sunset today" as const };
    }
    if (item.localSecret) {
      if (item.distanceKm < 25) return { ...item, discoveryBadge: "Hidden gem near you" as const };
      return { ...item, discoveryBadge: "Only locals know this spot" as const };
    }
    return { ...item, discoveryBadge: null };
  });
}
