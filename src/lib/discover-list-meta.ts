import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import { filterToSectionId } from "@/lib/discover-sections";
import { discoverListPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata, absoluteUrlForLocale } from "@/lib/locale-seo";
import { SITE_URL } from "@/lib/site-url";

/** URL filter params for place-category discover views (indexed in sitemap). */
export const DISCOVER_SECTION_FILTER_KEYS = [
  "nature",
  "ancient",
  "village",
  "wine",
  "monastery",
  "family",
  "accessible",
  "local",
  "hidden",
] as const;

export type DiscoverSectionFilterKey =
  (typeof DISCOVER_SECTION_FILTER_KEYS)[number];

export function isDiscoverSectionFilterKey(
  value: string
): value is DiscoverSectionFilterKey {
  return (DISCOVER_SECTION_FILTER_KEYS as readonly string[]).includes(value);
}

/** Maps URL filter param to meta.filters.* key in discover.page.meta. */
export function discoverSectionMetaKey(
  filterKey: string
): DiscoverSectionFilterKey | null {
  if (isDiscoverSectionFilterKey(filterKey)) return filterKey;
  const sectionId = filterToSectionId[filterKey];
  if (!sectionId) return null;
  const bySection: Record<string, DiscoverSectionFilterKey> = {
    coasts: "nature",
    ancient: "ancient",
    village: "village",
    wine: "wine",
    monastery: "monastery",
    family: "family",
    accessible: "accessible",
    local: "local",
    hidden: "hidden",
  };
  return bySection[sectionId] ?? null;
}

export function isIndexedDiscoverFilter(filterKey: string): boolean {
  return (
    isActivityFilterKey(filterKey) || isDiscoverSectionFilterKey(filterKey)
  );
}

export function discoverFilterPath(filterKey?: string): string {
  if (filterKey && isIndexedDiscoverFilter(filterKey)) {
    return `/discover?filter=${filterKey}`;
  }
  return "/discover";
}

export function absoluteDiscoverPageUrl(
  filterKey: string | undefined,
  locale: string
): string {
  return absoluteUrlForLocale(discoverFilterPath(filterKey), locale);
}

export async function buildDiscoverListMetadata(
  locale: string,
  filter?: string | string[] | null
): Promise<Metadata> {
  const filterKey =
    typeof filter === "string"
      ? filter
      : Array.isArray(filter)
        ? filter[0]
        : undefined;
  const t = await getTranslations({ locale, namespace: "discover.page.meta" });

  let title = t("title");
  let description = t("description");
  const path = discoverFilterPath(filterKey);

  if (filterKey && isActivityFilterKey(filterKey)) {
    title = t(`filters.${filterKey}.title`);
    description = t(`filters.${filterKey}.description`);
  } else if (filterKey) {
    const sectionMetaKey = discoverSectionMetaKey(filterKey);
    if (sectionMetaKey) {
      title = t(`filters.${sectionMetaKey}.title`);
      description = t(`filters.${sectionMetaKey}.description`);
    }
  }

  const ogImage = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;

  const base: Metadata = {
    ...discoverListPageMeta,
    title,
    description,
    openGraph: {
      ...(discoverListPageMeta.openGraph ?? { type: "website" }),
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Omodos village, Cyprus winter — discover curated places",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };

  return applyLocaleToMetadata(base, path, locale);
}
