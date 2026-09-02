import "server-only";
import { getTranslations } from "next-intl/server";
import { slugifyBestFor } from "@/lib/best-for-shared";

export { formatBestForSentence, slugifyBestFor } from "@/lib/best-for-shared";

/**
 * Returns a sync per-token localizer over `data.bestFor.{slug}` (BUG-110
 * message-overlay pattern, AUD-99 residual). Coverage of every token shipped
 * in the data layer is guarded by best-for.test.ts across all 7 locales; an
 * unmapped token (e.g. new data before its translations land) falls back to
 * the EN value instead of throwing. Sync-returning so hub pages can map
 * hundreds of chips off one translator load.
 */
export async function getBestForLocalizer(locale?: string): Promise<(token: string) => string> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.bestFor" })
    : await getTranslations("data.bestFor");
  return (token: string) => {
    const slug = slugifyBestFor(token);
    return t.has(slug) ? t(slug) : token;
  };
}
