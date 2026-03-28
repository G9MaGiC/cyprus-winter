import { searchPlaces } from "./search-places";

export type ItinerarySlot = {
  timeOfDay: "morning" | "afternoon" | "evening";
  id: string;
  name: string;
  type: string;
  region: string;
  reason: string;
};

export type ItineraryDay = {
  day: number;
  slots: ItinerarySlot[];
};

export type BuildItineraryInput = {
  region?: string;
  days: number;
  interests?: string[];
  userLocation?: { lat: number; lng: number };
};

const TIME_SLOTS: ("morning" | "afternoon" | "evening")[] = ["morning", "afternoon", "evening"];

const INTEREST_TO_CATEGORY: Record<string, string> = {
  wine: "winery",
  food: "restaurant",
  beach: "beach",
  nature: "nature",
  history: "ancient",
  hiking: "nature",
  villages: "village",
  village: "village",
  monastery: "monastery",
};

const SLOT_CATEGORY_HINTS: Record<string, string[]> = {
  morning: ["ancient", "nature", "beach"],
  afternoon: ["village", "monastery", "winery"],
  evening: ["winery", "restaurant", "village"],
};

export function buildItinerary(input: BuildItineraryInput): ItineraryDay[] {
  const { region, days, interests, userLocation } = input;
  const usedIds = new Set<string>();
  const result: ItineraryDay[] = [];

  for (let d = 1; d <= Math.min(days, 14); d++) {
    const slots: ItinerarySlot[] = [];

    for (const timeOfDay of TIME_SLOTS) {
      const categoryHints = SLOT_CATEGORY_HINTS[timeOfDay];
      const category = interests?.length
        ? interests[0]
        : categoryHints[d % categoryHints.length];

      const places = searchPlaces({
        query: category,
        region,
        categories: interests?.length
          ? interests.map((i) => INTEREST_TO_CATEGORY[i.toLowerCase()] ?? i)
          : undefined,
        season: "winter",
        userLocation,
        limit: 10,
      });

      const place = places.find((p) => !usedIds.has(p.id));
      if (place) {
        usedIds.add(place.id);
        slots.push({
          timeOfDay,
          id: place.id,
          name: place.name,
          type: (place as { type?: string }).type ?? "attraction",
          region: place.region,
          reason: `Fits ${timeOfDay} — ${place.description?.slice(0, 80) ?? ""}`,
        });
      }
    }

    result.push({ day: d, slots });
  }

  return result;
}
