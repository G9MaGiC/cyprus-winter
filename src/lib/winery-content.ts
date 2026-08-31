import "server-only";
import { getTranslations } from "next-intl/server";
import type { Winery } from "@/data/wineries";

/**
 * BUG-110 message-overlay pattern for winery decision-surface content
 * (AUD-10 / RICE 19.2 pilot): per-locale copy lives in messages under
 * `data.wineries.{id}.{field}` and is overlaid onto the base TS record at
 * render. Coverage is explicit — only ids in LOCALIZED_WINERY_IDS carry
 * catalog keys (guarded by winery-content.test.ts across all 7 locales);
 * everything else falls back to the EN base record.
 *
 * Scope notes:
 * - Server surfaces only (book hub + book detail). Client card surfaces
 *   (AttractionCard hours/tease) stay on the EN base until the
 *   isCallAheadHours EN-regex in place-card-hours.ts is restructured.
 * - JSON-LD keeps reading the EN base record for structured-data
 *   consistency.
 * - The runtime partner overlay (applyPartnerOpeningHours) is applied AFTER
 *   this one at call sites: live partner hours beat curated translation.
 */

export {
  LOCALIZED_WINERY_FIELDS,
  LOCALIZED_WINERY_IDS,
  type LocalizedWineryField,
} from "@/lib/winery-content-ids";
import { LOCALIZED_WINERY_FIELDS, LOCALIZED_WINERY_IDS } from "@/lib/winery-content-ids";

export async function localizeWineryContent(winery: Winery, locale?: string): Promise<Winery> {
  if (!LOCALIZED_WINERY_IDS.has(winery.id)) return winery;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.wineries" })
    : await getTranslations("data.wineries");
  const overlaid: Record<string, string> = {};
  for (const field of LOCALIZED_WINERY_FIELDS) {
    if (typeof winery[field] === "string") {
      overlaid[field] = t(`${winery.id}.${field}`);
    }
  }
  return { ...winery, ...overlaid };
}
