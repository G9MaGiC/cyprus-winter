import "server-only";
import { getTranslations } from "next-intl/server";
import type { Trail } from "@/data/trails";

/**
 * BUG-110 message-overlay pattern for trail decision-surface content
 * (AUD-10 slice 13): per-locale copy lives in messages under
 * `data.trails.{id}.{field}` and is overlaid onto the base TS record at
 * render. Coverage is explicit — only ids in LOCALIZED_TRAIL_IDS carry
 * catalog keys (guarded by trail-content.test.ts across all 7 locales);
 * everything else falls back to the EN base record. Metadata and JSON-LD
 * keep reading the EN base, same contract as the winery and attraction
 * overlays.
 */

export {
  LOCALIZED_TRAIL_FIELDS,
  LOCALIZED_TRAIL_IDS,
  type LocalizedTrailField,
} from "@/lib/trail-content-ids";
import {
  LOCALIZED_TRAIL_FIELDS,
  LOCALIZED_TRAIL_IDS,
} from "@/lib/trail-content-ids";

export async function localizeTrailContent(
  trail: Trail,
  locale?: string
): Promise<Trail> {
  if (!LOCALIZED_TRAIL_IDS.has(trail.id)) return trail;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.trails" })
    : await getTranslations("data.trails");
  const overlaid: Record<string, string> = {};
  for (const field of LOCALIZED_TRAIL_FIELDS) {
    if (typeof trail[field] === "string") {
      overlaid[field] = t(`${trail.id}.${field}`);
    }
  }
  return { ...trail, ...overlaid };
}
