import type { PlanItem } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { getTimeBucket, getPlaceTimeSignals, matchesTimeBucket, isAdjacentBucket, type TimeBucket } from "@/lib/right-now-buckets";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import type { WeatherAtCoords } from "@/lib/weather-live";
import { allPlaces } from "@/data";
import { getAttractionById, getRestaurantById } from "@/data";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { winterEvents } from "@/data/events";

/** Input for scoring: place + resolved entity fields */
export type ScorablePlace = PlanItem & {
  bestTimeToVisit?: string;
  openingHours?: string;
  winterTip?: string;
  localSecret?: string;
  winterOpen?: boolean;
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

/** Enrich PlanItem with entity fields for scoring */
function enrichPlace(place: PlanItem): ScorablePlace {
  const base: ScorablePlace = { ...place };
  if (place.type === "trail") {
    const t = trails.find((x) => x.id === place.id);
    if (t) {
      base.bestTimeToVisit = t.winterNotes;
      base.localSecret = t.localSecret;
    }
  } else if (place.type === "winery") {
    const w = wineries.find((x) => x.id === place.id);
    if (w) {
      base.bestTimeToVisit = w.bestTimeToVisit;
      base.openingHours = w.openingHours;
      base.winterTip = w.winterTip;
      base.localSecret = w.localSecret;
      base.winterOpen = w.winterOpen;
    }
  } else if (place.type === "restaurant") {
    const r = getRestaurantById(place.id);
    if (r) {
      base.bestTimeToVisit = r.bestTimeToVisit;
      base.openingHours = r.openingHours;
      base.winterTip = r.winterTip;
      base.localSecret = r.localSecret;
      base.winterOpen = r.winterOpen;
    }
  } else if (place.type === "attraction") {
    const a = getAttractionById(place.id);
    if (a) {
      base.bestTimeToVisit = a.bestTimeToVisit;
      base.openingHours = a.openingHours;
      base.winterTip = a.winterTip;
      base.localSecret = a.localSecret;
    }
  } else if (place.type === "event") {
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
 * Returns sorted by score descending.
 */
export function scoreAndRank(
  userLat: number,
  userLng: number,
  weather: WeatherAtCoords | null,
  limit = 12
): ScoredPlace[] {
  const currentBucket = getTimeBucket();
  const places = allPlaces.filter((p) =>
    ELIGIBLE_TYPES.includes(p.type as (typeof ELIGIBLE_TYPES)[number])
  );
  const enriched = places.map(enrichPlace);
  const withCoords = enriched
    .map((p) => {
      const coords = getPlaceCoords(p);
      if (!coords) return null;
      const km = haversineKm(userLat, userLng, coords.lat, coords.lng);
      const preferredBuckets = getPlaceTimeSignals(
        p.bestTimeToVisit ?? p.winterTip ?? p.openingHours,
        p.type
      );
      const timeScore = timeMatchScore(preferredBuckets, currentBucket);
      const distScore = distanceScore(km);
      const weatherScore = weatherMatchScore(p.type, weather);
      const liveScore = livenessScore(p);
      const score =
        0.25 * timeScore + 0.3 * distScore + 0.25 * weatherScore + 0.2 * liveScore;
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
  withCoords.sort((a, b) => b.score - a.score);
  return withCoords.slice(0, limit);
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
    if (current === "sunset" && clearWeather && ["beach", "restaurant", "ancient", "village", "nature"].includes(item.type)) {
      return { ...item, discoveryBadge: "Perfect for sunset today" as const };
    }
    if (item.localSecret) {
      if (item.distanceKm < 25) return { ...item, discoveryBadge: "Hidden gem near you" as const };
      return { ...item, discoveryBadge: "Only locals know this spot" as const };
    }
    return { ...item, discoveryBadge: null };
  });
}
