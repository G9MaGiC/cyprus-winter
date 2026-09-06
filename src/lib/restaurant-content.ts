import "server-only";
import { getTranslations } from "next-intl/server";
import type { Restaurant } from "@/data/restaurants";
import { isCallAheadHours } from "@/lib/place-card-hours";

/**
 * BUG-110 message-overlay pattern for restaurant content (data-layer arc,
 * class 7): per-locale copy lives in messages under
 * `data.restaurants.{id}.{field}` and is overlaid onto the base TS record
 * at render. Coverage is explicit — only ids in LOCALIZED_RESTAURANT_IDS
 * carry catalog keys (guarded by restaurant-content.test.ts across all 7
 * locales); everything else falls back to the EN base record. JSON-LD,
 * search, the concierge tools and related-places keep reading the EN base,
 * same contract as every other overlay class.
 */

export {
  LOCALIZED_RESTAURANT_FIELDS,
  LOCALIZED_RESTAURANT_IDS,
  type LocalizedRestaurantField,
} from "@/lib/restaurant-content-ids";
import {
  LOCALIZED_RESTAURANT_FIELDS,
  LOCALIZED_RESTAURANT_IDS,
} from "@/lib/restaurant-content-ids";

export async function localizeRestaurantContent(
  restaurant: Restaurant,
  locale?: string
): Promise<Restaurant> {
  if (!LOCALIZED_RESTAURANT_IDS.has(restaurant.id)) return restaurant;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.restaurants" })
    : await getTranslations("data.restaurants");
  const overlaid: Record<string, string> = {};
  for (const field of LOCALIZED_RESTAURANT_FIELDS) {
    if (typeof restaurant[field] === "string") {
      overlaid[field] = t(`${restaurant.id}.${field}`);
    }
  }
  return {
    ...restaurant,
    ...overlaid,
    // Call-ahead badge decided on the EN base BEFORE overlaying, so it
    // survives translation (same as winery-content.ts).
    hoursCallAhead: isCallAheadHours(restaurant.openingHours),
  };
}
