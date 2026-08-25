import { trails, type Trail } from "@/data/trails";

/**
 * Extra URL segments that still resolve to a trail after an id rename.
 * Needed when the old trail id is owned by another plan entity (attraction).
 */
const TRAIL_LEGACY_IDS: Record<string, string> = {
  stavrovouni: "stavrovouni-trail",
};

export function findTrailByIdOrSlug(id: string): Trail | undefined {
  const aliasedId = TRAIL_LEGACY_IDS[id];
  return trails.find((t) => t.id === id || t.slug === id || (aliasedId != null && t.id === aliasedId));
}

export function isTrailSlugAlias(id: string, trail: Trail): boolean {
  return id !== trail.id;
}
