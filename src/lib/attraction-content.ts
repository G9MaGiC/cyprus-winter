import "server-only";
import { getTranslations } from "next-intl/server";
import type { Attraction } from "@/data/attractions";
import { isCallAheadHours } from "@/lib/place-card-hours";

/**
 * BUG-110 message-overlay pattern for attraction decision-surface content
 * (AUD-10 slice 3): per-locale copy lives in messages under
 * `data.attractions.{id}.{field}` and is overlaid onto the base TS record at
 * render. Coverage is explicit — only ids in LOCALIZED_ATTRACTION_IDS carry
 * catalog keys (guarded by attraction-content.test.ts across all 7 locales);
 * everything else falls back to the EN base record. JSON-LD keeps reading the
 * EN base, same contract as the winery overlay.
 */

export {
  LOCALIZED_ATTRACTION_FIELDS,
  LOCALIZED_ATTRACTION_IDS,
  type LocalizedAttractionField,
} from "@/lib/attraction-content-ids";
import {
  LOCALIZED_ATTRACTION_FIELDS,
  LOCALIZED_ATTRACTION_IDS,
} from "@/lib/attraction-content-ids";

export async function localizeAttractionContent(
  attraction: Attraction,
  locale?: string
): Promise<Attraction> {
  if (!LOCALIZED_ATTRACTION_IDS.has(attraction.id)) return attraction;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.attractions" })
    : await getTranslations("data.attractions");
  const overlaid: Record<string, string> = {};
  for (const field of LOCALIZED_ATTRACTION_FIELDS) {
    if (typeof attraction[field] === "string") {
      overlaid[field] = t(`${attraction.id}.${field}`);
    }
  }
  return {
    ...attraction,
    ...overlaid,
    // Call-ahead badge decided on the EN base BEFORE overlaying, so it
    // survives translation (same as winery-content.ts).
    hoursCallAhead: isCallAheadHours(attraction.openingHours),
  };
}
