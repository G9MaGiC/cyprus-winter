import { getGuideById, getPlaceById, getDiscoverPlaceById } from "@/data";
import { isSafeInternalPath } from "@/lib/safe-internal-path";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";

/**
 * Resolve AI / chat action paths to a safe in-app route.
 * Validates prefix allowlist and known place IDs on discover/trail detail paths.
 */
export function resolveInternalPath(raw: string): string {
  const trimmed = raw?.trim() || "/discover";
  if (!isSafeInternalPath(trimmed)) return "/discover";

  const [pathname, search = ""] = trimmed.split("?");
  const base = pathname || "/discover";

  const discoverMatch = base.match(/^\/discover\/([^/]+)$/);
  if (discoverMatch) {
    const id = discoverMatch[1];
    // Trails are not discover detail pages — send AI/actions to the trail hub route.
    const trail = findTrailByIdOrSlug(id);
    if (trail) {
      const resolved = `/trails/${trail.id}`;
      return search ? `${resolved}?${search}` : resolved;
    }
    if (!getDiscoverPlaceById(id)) return "/discover";
    return search ? `${base}?${search}` : base;
  }

  const trailMatch = base.match(/^\/trails\/([^/]+)$/);
  if (trailMatch) {
    const segment = trailMatch[1];
    const trail = findTrailByIdOrSlug(segment);
    if (!trail) return "/trails";
    const resolved = `/trails/${trail.id}`;
    return search ? `${resolved}?${search}` : resolved;
  }

  const wineryMatch = base.match(/^\/book\/winery\/([^/]+)$/);
  if (wineryMatch && !getPlaceById(wineryMatch[1])) return "/bookings";

  const guideMatch = base.match(/^\/book\/guide\/([^/]+)$/);
  if (guideMatch && !getGuideById(guideMatch[1])) return "/book/guide";

  return search ? `${base}?${search}` : base;
}
