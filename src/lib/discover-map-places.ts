import { getPlaceById, getAttractionById } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { allDiscoverItems, type DiscoverItem } from "@/data/discover";
import type { Attraction } from "@/data/attractions";

import { trails } from "@/data/trails";
import type {
  DiscoverMapPinKind,
  DiscoverMapPlace,
} from "@/app/(padded)/discover/DiscoverMap";

export type { DiscoverMapPinKind, DiscoverMapPlace };

const discoverById = new Map(allDiscoverItems.map((item) => [item.id, item]));

export function resolveDiscoverMapKind(
  place: { type: string; id?: string },
  item?: DiscoverItem
): DiscoverMapPinKind {
  if (place.type === "winery") return "winery";
  if (place.type === "restaurant") return "eat";
  if (place.type === "trail") return "trail";

  const attraction =
    item && "type" in item && item.type !== "restaurant" && item.type !== "winery"
      ? (item as Attraction)
      : place.id
        ? getAttractionById(place.id)
        : undefined;

  if (!attraction) return "other";

  switch (attraction.type) {
    case "village":
      return "village";
    case "beach":
    case "nature":
      return "coast";
    case "ancient":
      return "ancient";
    case "monastery":
      return "monastery";
    case "activity":
      return "activity";
    default:
      return "other";
  }
}

function pushPlace(
  results: DiscoverMapPlace[],
  seen: Set<string>,
  place: DiscoverMapPlace
): void {
  if (seen.has(place.id)) return;
  seen.add(place.id);
  results.push(place);
}

function placeFromId(id: string, kindOverride?: DiscoverMapPinKind): DiscoverMapPlace | null {
  const place = getPlaceById(id);
  if (!place) return null;
  const coords = getPlaceCoords(place);
  if (!coords) return null;

  const item = discoverById.get(place.id);
  const kind = kindOverride ?? resolveDiscoverMapKind(place, item);
  const href =
    place.type === "trail"
      ? `/trails/${place.id}`
      : `/discover/${place.id}`;

  return {
    id: place.id,
    name: place.name,
    nameEl: place.nameEl,
    href,
    region: place.region,
    lat: coords.lat,
    lng: coords.lng,
    kind,
  };
}

/** Build trail markers from trail ids (activity filters). */
export function buildTrailMapPlaces(trailIds: string[]): DiscoverMapPlace[] {
  const results: DiscoverMapPlace[] = [];
  const seen = new Set<string>();
  for (const id of trailIds) {
    if (!trails.some((t) => t.id === id)) continue;
    const mapped = placeFromId(id, "trail");
    if (mapped) pushPlace(results, seen, mapped);
  }
  return results;
}

/** Build map markers for discover items; optional subset by place id. */
export function buildDiscoverMapPlaces(itemIds?: string[]): DiscoverMapPlace[] {
  const source =
    itemIds != null && itemIds.length > 0
      ? allDiscoverItems.filter((item) => itemIds.includes(item.id))
      : allDiscoverItems;

  const results: DiscoverMapPlace[] = [];
  const seen = new Set<string>();

  for (const item of source) {
    const mapped = placeFromId(item.id);
    if (mapped) pushPlace(results, seen, mapped);
  }

  return results;
}

export type BuildDiscoverMapFromSectionsOptions = {
  includeTrailLinks?: boolean;
};

/** Build typed map places from filtered discover sections (+ trail links for activity filters). */
/** Structural section shape: the map only reads item/trail-link ids, so both
 * full DiscoverSection and lean DiscoverCardSection inputs are accepted. */
type MapSourceSection = {
  items: { id: string }[];
  trailLinks?: { id: string }[];
};

export function buildDiscoverMapPlacesFromSections(
  sections: MapSourceSection[],
  options: BuildDiscoverMapFromSectionsOptions = {}
): DiscoverMapPlace[] {
  const { includeTrailLinks = false } = options;
  const results: DiscoverMapPlace[] = [];
  const seen = new Set<string>();

  for (const section of sections) {
    for (const item of section.items) {
      const mapped = placeFromId(item.id);
      if (mapped) pushPlace(results, seen, mapped);
    }
    if (includeTrailLinks && section.trailLinks) {
      for (const link of section.trailLinks) {
        const mapped = placeFromId(link.id, "trail");
        if (mapped) pushPlace(results, seen, mapped);
      }
    }
  }

  return results;
}

/** Kinds present in the current place set (for legend). */
export function activeMapPinKinds(places: DiscoverMapPlace[]): DiscoverMapPinKind[] {
  const order: DiscoverMapPinKind[] = [
    "winery",
    "village",
    "trail",
    "ancient",
    "coast",
    "eat",
    "monastery",
    "activity",
    "other",
  ];
  const present = new Set(places.map((p) => p.kind));
  return order.filter((k) => present.has(k));
}
