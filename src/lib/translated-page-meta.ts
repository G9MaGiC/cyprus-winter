import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { SITE_URL } from "@/lib/site-url";

export type TranslatedHubMetaConfig = {
  path: string;
  /** Namespace with `meta.title` / `meta.description` (e.g. `beaches.page`). */
  namespace: string;
  ogImage?: string;
  /** `meta.*` key for OG description; falls back to description. */
  ogDescriptionKey?: string;
  /** `meta.*` key for OG image alt. */
  ogAltKey?: string;
};

/** Guest hubs that already have localized `*.page.meta` (or hub) keys. */
export const TRANSLATED_HUB_META = {
  beaches: {
    path: "/beaches",
    namespace: "beaches.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-beach-nissi.jpg`,
    ogDescriptionKey: "schemaDescription",
    ogAltKey: "ogAlt",
  },
  wineries: {
    path: "/wineries",
    namespace: "wineries.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogAlt",
  },
  villages: {
    path: "/villages",
    namespace: "villages.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogAlt",
  },
  cycling: {
    path: "/cycling",
    namespace: "cycling.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-trail-troodos.jpg`,
    ogDescriptionKey: "schemaDescription",
    ogAltKey: "ogAlt",
  },
  wineRoutes: {
    path: "/wine-routes",
    namespace: "wineRoutes.hub",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogAlt",
  },
  trails: {
    path: "/trails",
    namespace: "trails.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-trail-troodos.jpg`,
    ogDescriptionKey: "ogDescription",
  },
  airport: {
    path: "/airport",
    namespace: "airport.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-airport-coast.jpg`,
    ogAltKey: "ogAlt",
  },
  weather: {
    path: "/weather",
    namespace: "weather.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogImageAlt",
  },
  secrets: {
    path: "/secrets",
    namespace: "secrets.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogAlt",
  },
  search: {
    path: "/search",
    namespace: "search.page",
    ogImage: `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`,
    ogDescriptionKey: "ogDescription",
    ogAltKey: "ogAlt",
  },
  team: {
    path: "/team",
    namespace: "team.page",
  },
  bookWinery: {
    path: "/book/winery",
    namespace: "book.pages.wineryList",
  },
  bookGuide: {
    path: "/book/guide",
    namespace: "book.pages.guideList",
  },
} as const satisfies Record<string, TranslatedHubMetaConfig>;

export type TranslatedHubId = keyof typeof TRANSLATED_HUB_META;

/**
 * Build locale-aware title/description/OG for `[locale]` hubs that currently
 * overrode padded `generateMetadata` with English `locale-page-meta` constants.
 */
export async function buildTranslatedHubMetadata(
  hub: TranslatedHubId,
  locale: string
): Promise<Metadata> {
  const config: TranslatedHubMetaConfig = TRANSLATED_HUB_META[hub];
  const t = await getTranslations({ locale, namespace: config.namespace });
  const title = t("meta.title");
  const description = t("meta.description");

  let ogDescription = description;
  if (config.ogDescriptionKey && t.has(`meta.${config.ogDescriptionKey}`)) {
    ogDescription = t(`meta.${config.ogDescriptionKey}`);
  }

  let ogAlt: string | undefined;
  if (config.ogAltKey && t.has(`meta.${config.ogAltKey}`)) {
    ogAlt = t(`meta.${config.ogAltKey}`);
  }

  const base: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description: ogDescription,
      type: "website",
      ...(config.ogImage
        ? {
            images: [
              {
                url: config.ogImage,
                width: 1200,
                height: 630,
                ...(ogAlt ? { alt: ogAlt } : {}),
              },
            ],
          }
        : {}),
    },
  };

  return applyLocaleToMetadata(base, config.path, locale);
}
