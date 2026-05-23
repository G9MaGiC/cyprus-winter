import { allDiscoverIds } from "@/data/discover";
import { getPlaceById } from "@/data";
import { trails } from "@/data/trails";

/** Canonical set of place IDs resolvable via getPlaceById (includes trail slugs). */
export function buildCanonicalPlaceIdSet(): Set<string> {
  const ids = new Set<string>();
  for (const id of allDiscoverIds) ids.add(id);
  for (const t of trails) {
    ids.add(t.id);
    if (t.slug) ids.add(t.slug);
  }
  return ids;
}

export const CANONICAL_PLACE_IDS = buildCanonicalPlaceIdSet();

export function isCanonicalPlaceId(id: string): boolean {
  return CANONICAL_PLACE_IDS.has(id);
}

export function resolvePlaceId(id: string): string | undefined {
  return getPlaceById(id)?.id;
}
