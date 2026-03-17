import { decodeItinerary, MAX_DAYS } from "@/lib/itinerary-share";

const STORAGE_KEY = "cyprus-winter-itinerary";

export function emptyDays(): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  for (let d = 1; d <= MAX_DAYS; d++) out[d] = [];
  return out;
}

export function loadItineraryFromStorage(): Record<number, string[]> {
  if (typeof window === "undefined") return emptyDays();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string[]>;
      const out = emptyDays();
      for (const [k, v] of Object.entries(parsed)) {
        const d = parseInt(k, 10);
        if (d >= 1 && d <= MAX_DAYS && Array.isArray(v)) out[d] = v;
      }
      return out;
    }
  } catch {
    // ignore
  }
  return emptyDays();
}

export function loadItineraryFromUrl(searchParams: URLSearchParams): Record<number, string[]> | null {
  return decodeItinerary(searchParams.get("plan"));
}

export function persistItineraryToStorage(days: Record<number, string[]>) {
  if (typeof window === "undefined") return;
  try {
    const toStore: Record<string, string[]> = {};
    for (let d = 1; d <= MAX_DAYS; d++) toStore[String(d)] = days[d] ?? [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
}

export function getItineraryStorageKey() {
  return STORAGE_KEY;
}

