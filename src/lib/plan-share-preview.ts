import { getPlaceById, type PlanItem } from "@/data";
import type { ItineraryDays } from "@/lib/itinerary-share";

const NAMED_ALL_MAX = 3;
const NAMED_WITH_REMAINDER = 2;

export type PlanSharePreview = {
  named: string[];
  extraCount: number;
  placeCount: number;
  dayCount: number;
  firstPlaceId: string | null;
  firstPlaceType: PlanItem["type"] | null;
};

export type PlanSharePlacesLineLabels = {
  two: (a: string, b: string) => string;
  three: (a: string, b: string, c: string) => string;
  more: (a: string, b: string, count: number) => string;
};

/** Ordered unique places from an itinerary, for share titles and OG copy. */
export function buildPlanSharePreview(days: ItineraryDays | null): PlanSharePreview | null {
  if (!days) return null;

  const seen = new Set<string>();
  const places: PlanItem[] = [];
  let dayCount = 0;

  for (const ids of Object.values(days)) {
    const valid = ids.map((id) => getPlaceById(id)).filter((p): p is PlanItem => Boolean(p));
    if (valid.length === 0) continue;
    dayCount += 1;
    for (const place of valid) {
      if (seen.has(place.id)) continue;
      seen.add(place.id);
      places.push(place);
    }
  }

  if (places.length === 0) return null;

  const namedPlaces =
    places.length <= NAMED_ALL_MAX
      ? places
      : places.slice(0, NAMED_WITH_REMAINDER);
  return {
    named: namedPlaces.map((p) => p.name),
    extraCount: Math.max(0, places.length - namedPlaces.length),
    placeCount: places.length,
    dayCount,
    firstPlaceId: places[0]?.id ?? null,
    firstPlaceType: places[0]?.type ?? null,
  };
}

export function formatPlanSharePlacesLine(
  named: string[],
  extraCount: number,
  labels: PlanSharePlacesLineLabels
): string {
  if (named.length === 0) return "";
  if (extraCount > 0 && named.length >= 2) {
    return labels.more(named[0], named[1], extraCount);
  }
  if (named.length === 1) return named[0];
  if (named.length === 2) return labels.two(named[0], named[1]);
  return labels.three(named[0], named[1], named[2]);
}

export type PlanShareCopyLabels = PlanSharePlacesLineLabels & {
  title: (places: string) => string;
  description: (places: string, placeCount: number, dayCount: number) => string;
};

export type PlanShareCopy = {
  title: string;
  description: string;
  placesLine: string;
};

export function buildPlanShareCopy(
  preview: PlanSharePreview | null,
  labels: PlanShareCopyLabels
): PlanShareCopy | null {
  if (!preview) return null;
  const placesLine = formatPlanSharePlacesLine(preview.named, preview.extraCount, labels);
  return {
    title: labels.title(placesLine),
    description: labels.description(placesLine, preview.placeCount, preview.dayCount),
    placesLine,
  };
}
