import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import type { Attraction } from "@/data/attractions";

/** Get place IDs that pair well with this place (trails, wineries, villages, restaurants). */
export function getCombineWith(id: string): string[] {
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (trail?.combineWith?.length) return trail.combineWith;
  const attr = allAttractions.find((a) => a.id === id);
  if (attr?.combineWith?.length) return attr.combineWith;
  const winery = wineries.find((w) => w.id === id);
  if (winery?.combineWith?.length) return winery.combineWith;
  const restaurant = restaurants.find((r) => r.id === id);
  if (restaurant?.combineWith?.length) return restaurant.combineWith;
  return [];
}

export type RelatedPlace = {
  id: string;
  name: string;
  href: string;
  type: "attraction" | "trail" | "winery" | "restaurant";
};

/**
 * Resolves combineWith IDs to related places. Unknown IDs are silently skipped
 * (no broken links); "Combine your day" may show fewer items if data has stale IDs.
 * Run data validation/lint to catch orphan combineWith references.
 */
export function getRelatedPlaces(ids: string[]): RelatedPlace[] {
  const result: RelatedPlace[] = [];
  for (const id of ids) {
    const attr = allAttractions.find((a) => a.id === id);
    if (attr) {
      result.push({
        id: attr.id,
        name: attr.name,
        href: `/discover/${attr.id}`,
        type: attr.type === "winery" ? "winery" : "attraction",
      });
      continue;
    }
    const trail = trails.find((t) => t.id === id || t.slug === id);
    if (trail) {
      result.push({
        id: trail.id,
        name: trail.name,
        href: `/trails/${trail.id}`,
        type: "trail",
      });
      continue;
    }
    const restaurant = restaurants.find((r) => r.id === id);
    if (restaurant) {
      result.push({
        id: restaurant.id,
        name: restaurant.name,
        href: `/discover/${restaurant.id}`,
        type: "restaurant",
      });
    }
  }
  return result;
}

/** Normalize region for comparison (e.g. "Pelendri (Limassol)" → "Limassol"). */
function primaryRegion(region: string): string {
  const m = region.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : region.trim();
}

/** Region strings match if they share the same primary region. */
function sameRegion(a: string, b: string): boolean {
  return primaryRegion(a).toLowerCase() === primaryRegion(b).toLowerCase();
}

/** Get similar discover places: same type, same region, excluding current. Max 4. */
export function getSimilarDiscoverPlaces(
  currentId: string,
  type: string,
  region: string,
  limit = 4
): RelatedPlace[] {
  // allAttractions already includes wineries; add restaurants only to avoid duplicates
  const all: { id: string; name: string; region: string; type: string }[] = [
    ...allAttractions.map((a: Attraction) => ({
      id: a.id,
      name: a.name,
      region: a.region,
      type: a.type,
    })),
    ...restaurants.map((r) => ({ id: r.id, name: r.name, region: r.region, type: "restaurant" })),
  ];
  const seen = new Set<string>();
  const sameTypeAndRegion = all.filter(
    (p) =>
      p.id !== currentId &&
      p.type === type &&
      sameRegion(p.region, region) &&
      !seen.has(p.id) &&
      (seen.add(p.id), true)
  );
  return getRelatedPlaces(sameTypeAndRegion.slice(0, limit).map((p) => p.id));
}
