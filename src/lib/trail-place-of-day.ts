/**
 * Trail of the Day — deterministic daily pick with conditions preference.
 * Prefers open + dry trails when available; falls back to any trail.
 */

import { trails, trailConditions } from "@/data/trails";
import { pickDailySafeWithBoost } from "@/lib/daily-rotator";
import { PROMOTED_TRAIL_IDS } from "@/data/promoted";
import { getTrailImage } from "@/lib/cyprus-images";
import { getPlaceById } from "@/data";
import type { Trail } from "@/data/trails";

export type TrailPlaceOfDayOverlayKey = "openWithTemp" | "open" | "caution" | "seeConditions";

export type TrailPlaceOfDayPick = {
  id: string;
  name: string;
  /** Greek-first titles via getLocalizedName, same contract as the cards. */
  nameEl?: string;
  region: string;
  href: string;
  image: string;
  imageAlt: string;
  tease: string;
  /** Localized in TrailsPlaceOfDay via trails.placeOfDay.overlay.* */
  overlayKey: TrailPlaceOfDayOverlayKey;
  temperatureC?: number;
  status?: "open" | "caution" | "closed";
  pairWith?: { name: string; nameEl?: string; href: string };
};

function isIdealConditions(trail: Trail): boolean {
  const c = trailConditions[trail.id];
  return !!(
    c?.status === "open" &&
    (c.surface === "dry" || !c.surface) &&
    (c.temperatureC == null || (c.temperatureC >= 10 && c.temperatureC <= 22))
  );
}

export function getTrailPlaceOfDayPick(): TrailPlaceOfDayPick | null {
  const ideal = trails.filter(isIdealConditions);
  const pool = ideal.length > 0 ? ideal : trails;
  const picked = pickDailySafeWithBoost(
    pool,
    PROMOTED_TRAIL_IDS,
    "trail-place-of-day",
    5
  );
  if (!picked) return null;

  const conditions = trailConditions[picked.id];
  const combineWith = picked.combineWith?.[0];
  const pairPlace = combineWith ? getPlaceById(combineWith) : undefined;
  const pairHref =
    pairPlace?.type === "trail"
      ? `/trails/${pairPlace.id}`
      : pairPlace
        ? `/discover/${pairPlace.id}`
        : undefined;

  const overlayKey: TrailPlaceOfDayOverlayKey =
    conditions?.status === "open"
      ? conditions.temperatureC != null
        ? "openWithTemp"
        : "open"
      : conditions?.status === "caution"
        ? "caution"
        : "seeConditions";

  return {
    id: picked.id,
    name: picked.name,
    nameEl: picked.nameEl,
    region: picked.region,
    href: `/trails/${picked.id}`,
    image: getTrailImage(picked.id),
    imageAlt: `${picked.name}, ${picked.region} — ${picked.lengthKm} km trail in Cyprus winter`,
    tease: (() => {
      const first = picked.description.split(".")[0]?.trim();
      return first ? `${first}.` : `${picked.region}. Winter hike.`;
    })(),
    overlayKey,
    temperatureC: conditions?.temperatureC,
    status: conditions?.status,
    pairWith:
      pairPlace && pairHref
        ? { name: pairPlace.name, nameEl: pairPlace.nameEl, href: pairHref }
        : undefined,
  };
}
