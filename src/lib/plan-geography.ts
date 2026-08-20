/**
 * Grant KPI: share of Plan adds that are rural/mountain vs beach/coast.
 * Classifies from curated `src/data/` (place type, trail region, activity lists) — not invented GPS.
 */
import { getAttractionById, getPlaceById } from "@/data";
import { trails } from "@/data/trails";
import { ACTIVITY_PLACE_IDS } from "@/lib/activity-catalog";
import { COASTAL_TRAIL_IDS } from "@/lib/trails-sections";

export const PLAN_GEOGRAPHY_BUCKETS = [
  "rural_mountain",
  "beach_coast",
  "other",
  "unknown",
] as const;

export type PlanGeographyBucket = (typeof PLAN_GEOGRAPHY_BUCKETS)[number];

export type PlanGeographySource = "plan_add.item_id";

/** East/north coastal trail regions in `TRAIL_REGIONS`. Paphos/Limassol are mixed. */
const COASTAL_TRAIL_REGIONS = new Set(["Ayia Napa", "Famagusta", "Larnaca", "Kyrenia"]);

const COASTAL_TRAIL_ID_SET = new Set<string>([
  ...COASTAL_TRAIL_IDS,
  "aphrodite",
]);

const COASTAL_CYCLING_IDS = new Set([
  "akamas-latchi-cycling",
  "limassol-coastal-cycle",
  "larnaca-village-coastal-cycle",
]);

const COASTAL_ACTIVITY_IDS = new Set<string>([
  ...ACTIVITY_PLACE_IDS.watersports,
  ...COASTAL_CYCLING_IDS,
  "kourion-coastal-scramble",
  "cape-greco-climbing",
  "petra-tou-romiou-cliffs",
]);

function trailByPlaceId(id: string) {
  return trails.find((t) => t.id === id || t.slug === id);
}

export function planGeographyBucket(id: string | undefined | null): PlanGeographyBucket {
  if (!id || typeof id !== "string") return "unknown";
  const place = getPlaceById(id);
  if (!place) return "unknown";

  const attraction = getAttractionById(place.id);
  if (attraction?.type === "beach") return "beach_coast";
  if (COASTAL_ACTIVITY_IDS.has(place.id)) return "beach_coast";

  if (place.type === "trail") {
    const trail = trailByPlaceId(place.id);
    if (
      trail &&
      (COASTAL_TRAIL_ID_SET.has(trail.id) || COASTAL_TRAIL_REGIONS.has(trail.region))
    ) {
      return "beach_coast";
    }
    return "rural_mountain";
  }

  if (place.type === "winery") return "rural_mountain";
  if (
    attraction?.type === "village" ||
    attraction?.type === "monastery" ||
    attraction?.type === "nature"
  ) {
    return "rural_mountain";
  }

  if (place.type === "activity" || attraction?.type === "activity") {
    if (COASTAL_ACTIVITY_IDS.has(place.id)) return "beach_coast";
    return "rural_mountain";
  }

  return "other";
}

export function countPlanGeography(ids: Array<string | undefined | null>): Record<PlanGeographyBucket, number> {
  const counts: Record<PlanGeographyBucket, number> = {
    rural_mountain: 0,
    beach_coast: 0,
    other: 0,
    unknown: 0,
  };
  for (const id of ids) {
    counts[planGeographyBucket(id)] += 1;
  }
  return counts;
}

export function planGeographyRows(
  counts: Record<PlanGeographyBucket, number>
): { bucket: PlanGeographyBucket; count: number }[] {
  return PLAN_GEOGRAPHY_BUCKETS.map((bucket) => ({ bucket, count: counts[bucket] })).filter(
    (row) => row.count > 0
  );
}
