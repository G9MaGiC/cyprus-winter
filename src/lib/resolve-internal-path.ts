import { getGuideById, getPlaceById } from "@/data";
import { trails } from "@/data/trails";
import { isSafeInternalPath } from "@/lib/safe-internal-path";

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
    if (!getPlaceById(id)) return "/discover";
    return search ? `${base}?${search}` : base;
  }

  const trailMatch = base.match(/^\/trails\/([^/]+)$/);
  if (trailMatch) {
    const segment = trailMatch[1];
    const trail = trails.find((t) => t.id === segment || t.slug === segment);
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
