/**
 * Reads and parses the user's itinerary from localStorage for chat context.
 * Returns structured data for the chat API.
 */

const ITINERARY_STORAGE_KEY = "cyprus-winter-itinerary";
const MAX_DAYS = 14;

export type ItineraryEntry = { day: number; placeIds: string[] };

export function getItineraryForChat(): ItineraryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ITINERARY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return [];
    const entries: ItineraryEntry[] = [];
    for (let d = 1; d <= MAX_DAYS; d++) {
      const val = parsed[String(d)];
      if (Array.isArray(val)) {
        const placeIds = val.filter((id): id is string => typeof id === "string").slice(0, 20);
        if (placeIds.length > 0) {
          entries.push({ day: d, placeIds });
        }
      }
    }
    return entries;
  } catch {
    return [];
  }
}
