import "server-only";
import { getTranslations } from "next-intl/server";
import type { NatureExcursion } from "@/lib/nature-excursion-types";

/**
 * BUG-110 message-overlay pattern for the nature excursions — data-layer arc,
 * class 4: per-locale copy lives under `data.natureExcursions.{id}.*` and is
 * overlaid onto the base TS record before the list crosses the client
 * boundary (the section component receives the localized array as a prop).
 * `name` stays the EN base per the register's naming policy; `winterNote` is
 * optional exactly where the base record has one.
 */

export async function localizeNatureExcursions(
  excursions: NatureExcursion[],
  locale?: string
): Promise<NatureExcursion[]> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.natureExcursions" })
    : await getTranslations("data.natureExcursions");
  return excursions.map((site) => ({
    ...site,
    description: t(`${site.id}.description`),
    ...(site.winterNote ? { winterNote: t(`${site.id}.winterNote`) } : {}),
  }));
}
