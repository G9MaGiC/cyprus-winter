import "server-only";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";
import type { Winery } from "@/data/wineries";
import { LOCALIZED_WINERY_IDS } from "@/lib/winery-content-ids";
import { LOCALIZED_ATTRACTION_IDS } from "@/lib/attraction-content-ids";
import { LOCALIZED_RESTAURANT_IDS } from "@/lib/restaurant-content-ids";
import { localizeWineryContent } from "@/lib/winery-content";
import { localizeAttractionContent } from "@/lib/attraction-content";
import { localizeRestaurantContent } from "@/lib/restaurant-content";

/**
 * One entry point for the AUD-10 content overlay across discover-shaped
 * records: id-gated dispatch to the winery, attraction or restaurant
 * overlay (all are no-ops off their coverage sets). The id sets are
 * disjoint and each id is guaranteed the matching record shape by its
 * overlay's guard test, which is what makes the casts safe — `type:
 * "winery"` alone doesn't discriminate (Attractions carry it too).
 */
export async function localizeDiscoverContent<T extends { id: string }>(
  item: T,
  locale?: string
): Promise<T> {
  if (LOCALIZED_WINERY_IDS.has(item.id)) {
    return (await localizeWineryContent(item as unknown as Winery, locale)) as unknown as T;
  }
  if (LOCALIZED_ATTRACTION_IDS.has(item.id)) {
    return (await localizeAttractionContent(
      item as unknown as Attraction,
      locale
    )) as unknown as T;
  }
  if (LOCALIZED_RESTAURANT_IDS.has(item.id)) {
    return (await localizeRestaurantContent(
      item as unknown as Restaurant,
      locale
    )) as unknown as T;
  }
  return item;
}
