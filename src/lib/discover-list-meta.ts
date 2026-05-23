import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import { discoverListPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export async function buildDiscoverListMetadata(
  locale: string,
  filter?: string | string[] | null
): Promise<Metadata> {
  const filterKey = typeof filter === "string" ? filter : Array.isArray(filter) ? filter[0] : undefined;
  const t = await getTranslations({ locale, namespace: "discover.page.meta" });

  let title = t("title");
  let description = t("description");
  const path =
    filterKey && isActivityFilterKey(filterKey)
      ? `/discover?filter=${filterKey}`
      : "/discover";

  if (filterKey && isActivityFilterKey(filterKey)) {
    title = t(`filters.${filterKey}.title`);
    description = t(`filters.${filterKey}.description`);
  }

  const base: Metadata = {
    ...discoverListPageMeta,
    title,
    description,
    openGraph: discoverListPageMeta.openGraph
      ? { ...discoverListPageMeta.openGraph, title, description }
      : { title, description, type: "website" },
  };

  return applyLocaleToMetadata(base, path, locale);
}
