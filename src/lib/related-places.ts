import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";

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
