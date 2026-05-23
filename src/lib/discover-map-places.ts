import { getPlaceById } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { allDiscoverItems } from "@/data/discover";
import type { DiscoverMapPlace } from "@/app/(padded)/discover/DiscoverMap";

/** Build map markers for discover items; optional subset by place id. */
export function buildDiscoverMapPlaces(itemIds?: string[]): DiscoverMapPlace[] {
  const source =
    itemIds != null && itemIds.length > 0
      ? allDiscoverItems.filter((item) => itemIds.includes(item.id))
      : allDiscoverItems;

  const results: DiscoverMapPlace[] = [];
  const seen = new Set<string>();

  for (const item of source) {
    const place = getPlaceById(item.id);
    if (!place) continue;
    const coords = getPlaceCoords(place);
    if (!coords) continue;
    if (seen.has(place.id)) continue;
    seen.add(place.id);

    results.push({
      id: place.id,
      name: place.name,
      href: `/discover/${place.id}`,
      region: place.region,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return results;
}
