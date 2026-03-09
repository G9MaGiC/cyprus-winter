/**
 * Encode/decode itinerary for shareable URLs.
 * Format: 1:id1,id2|2:id3|3: → /plan?plan=...
 * Only valid place IDs (known to getPlaceById) are included.
 */
import { getPlaceById } from "@/data";

export type ItineraryDays = Record<number, string[]>;

/** Max days in the itinerary (supports Claire's 10–14 day stays). */
export const MAX_DAYS = 14;

/** Encode itinerary to URL-safe string. Skips invalid place IDs. */
export function encodeItinerary(days: ItineraryDays): string {
  const parts: string[] = [];
  for (let d = 1; d <= MAX_DAYS; d++) {
    const ids = days[d] ?? [];
    const valid = ids.filter((id) => getPlaceById(id));
    if (valid.length > 0) {
      parts.push(`${d}:${valid.join(",")}`);
    }
  }
  return parts.join("|");
}

/** Decode URL param to itinerary. Returns null if invalid or empty. */
export function decodeItinerary(param: string | null): ItineraryDays | null {
  if (!param || typeof param !== "string") return null;
  const trimmed = param.trim();
  if (!trimmed || trimmed.length > 2000) return null;

  const out: ItineraryDays = Object.fromEntries(
    Array.from({ length: MAX_DAYS }, (_, i) => [i + 1, [] as string[]])
  ) as ItineraryDays;
  const dayParts = trimmed.split("|");

  for (const part of dayParts) {
    const colon = part.indexOf(":");
    if (colon < 1) continue;
    const day = parseInt(part.slice(0, colon), 10);
    if (day < 1 || day > MAX_DAYS) continue;
    const ids = part
      .slice(colon + 1)
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && getPlaceById(s));
    if (ids.length > 0) out[day] = ids;
  }

  const hasAny = Object.values(out).some((arr) => arr.length > 0);
  return hasAny ? out : null;
}

/** Build share path for plan page with encoded itinerary. */
export function buildPlanSharePath(days: ItineraryDays): string {
  const encoded = encodeItinerary(days);
  if (!encoded) return "/plan";
  return `/plan?plan=${encodeURIComponent(encoded)}`;
}
