import "server-only";
import { getTranslations } from "next-intl/server";
import type { SecretGem } from "@/data/secret-gems";

/**
 * BUG-110 message-overlay pattern for secret-gem content (AUD-10, the final
 * content class): per-locale copy lives in messages under
 * `data.secretGems.{id}.{field}` and is overlaid onto the base TS record at
 * render. Coverage is explicit — only ids in LOCALIZED_SECRET_GEM_IDS carry
 * catalog keys (guarded by secret-gem-content.test.ts across all 7 locales);
 * everything else falls back to the EN base record. Search indexing and any
 * structured data keep reading the EN base, same contract as the winery,
 * attraction and trail overlays.
 */

export {
  LOCALIZED_SECRET_GEM_FIELDS,
  LOCALIZED_SECRET_GEM_IDS,
  type LocalizedSecretGemField,
} from "@/lib/secret-gem-content-ids";
import {
  LOCALIZED_SECRET_GEM_FIELDS,
  LOCALIZED_SECRET_GEM_IDS,
} from "@/lib/secret-gem-content-ids";

export async function localizeSecretGems(
  gems: SecretGem[],
  locale?: string
): Promise<SecretGem[]> {
  if (!gems.some((g) => LOCALIZED_SECRET_GEM_IDS.has(g.id))) return gems;
  const t = locale
    ? await getTranslations({ locale, namespace: "data.secretGems" })
    : await getTranslations("data.secretGems");
  return gems.map((gem) => {
    if (!LOCALIZED_SECRET_GEM_IDS.has(gem.id)) return gem;
    const overlaid: Record<string, string> = {};
    for (const field of LOCALIZED_SECRET_GEM_FIELDS) {
      overlaid[field] = t(`${gem.id}.${field}`);
    }
    return { ...gem, ...overlaid };
  });
}
