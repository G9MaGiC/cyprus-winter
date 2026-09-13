import { decodeItinerary, MAX_DAYS } from "@/lib/itinerary-share";

const STORAGE_KEY = "cyprus-winter-itinerary";
/** Session-scoped: this tab already adopted a given `?plan=` snapshot. */
export const APPLIED_PLAN_SESSION_KEY = "cyprus-winter-applied-plan";

export type ItineraryDays = Record<number, string[]>;

export type ResolveItineraryHydrationInput = {
  planParam: string | null;
  fromUrl: ItineraryDays | null;
  fromStorage: ItineraryDays;
  appliedPlanParam: string | null;
};

export type ResolveItineraryHydrationResult = {
  days: ItineraryDays;
  nextAppliedPlanParam: string | null;
  adoptedFromUrl: boolean;
};

/**
 * First open of a share URL wins over localStorage. Re-opening the same
 * snapshot (refresh / remount while `?plan=` is still in the query) keeps
 * the stored itinerary so later edits are not wiped.
 */
export function resolveItineraryHydration({
  planParam,
  fromUrl,
  fromStorage,
  appliedPlanParam,
}: ResolveItineraryHydrationInput): ResolveItineraryHydrationResult {
  if (fromUrl && planParam && appliedPlanParam !== planParam) {
    return {
      days: fromUrl,
      nextAppliedPlanParam: planParam,
      adoptedFromUrl: true,
    };
  }
  return {
    days: fromStorage,
    nextAppliedPlanParam: appliedPlanParam,
    adoptedFromUrl: false,
  };
}

export function readAppliedPlanParam(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(APPLIED_PLAN_SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeAppliedPlanParam(param: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(APPLIED_PLAN_SESSION_KEY, param);
  } catch {
    // ignore quota / private-mode
  }
}

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

