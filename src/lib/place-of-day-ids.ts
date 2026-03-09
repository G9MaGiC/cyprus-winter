/**
 * Centralised place-of-day IDs for today.
 * Used by Right Now and other algorithms to boost curated picks.
 * Signals: date (deterministic rotation), promoted IDs, type diversity.
 */
import { allPlaces } from "@/data";
import { allDiscoverItems } from "@/data/discover";
import { PROMOTED_PLACE_IDS } from "@/data/promoted";
import { pickDailyWithKey, pickDailyMultipleWithTypeDiversity } from "@/lib/daily-rotator";

const HOME_PLACE_TYPES = ["attraction", "trail", "winery"] as const;

/**
 * Returns the set of place IDs featured as "place of the day" today.
 * Includes: Home Place of Day (1), Discover Place of Day picks (3–5).
 * Use for algorithmic boost (Right Now, search, etc.).
 */
export function getPlaceOfDayIds(): Set<string> {
  const ids = new Set<string>();

  const homeCandidates = allPlaces.filter((p) =>
    HOME_PLACE_TYPES.includes(p.type as (typeof HOME_PLACE_TYPES)[number])
  );
  if (homeCandidates.length > 0) {
    const homePick = pickDailyWithKey(homeCandidates, "place-of-day");
    ids.add(homePick.id);
  }

  if (allDiscoverItems.length > 0) {
    const discoverPicks = pickDailyMultipleWithTypeDiversity(
      allDiscoverItems,
      PROMOTED_PLACE_IDS,
      "discover-place-of-day",
      3,
      5
    );
    for (const p of discoverPicks) ids.add(p.id);
  }

  return ids;
}
