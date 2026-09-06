import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDiscoverPlaceById } from "@/data";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { REGION_CONFIGS } from "@/data/regions";
import { WINE_ROUTES } from "@/data/wine-routes";
import { weatherByMonth } from "@/data/weather";
import { localizeWeatherRow } from "@/lib/weather-content";
import { localizeWineRoute } from "@/lib/wine-route-content";
import { localizeDiscoverContent } from "@/lib/discover-content";
import { getAttractionImage } from "@/lib/cyprus-images";
import { getTrailImage } from "@/lib/cyprus-images";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";
import { wineriesForRoute } from "@/lib/wine-route-stops";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-url";

const MONTH_SLUGS = ["november", "december", "january", "february", "march", "april"] as const;
type MonthSlug = (typeof MONTH_SLUGS)[number];

const SLUG_TO_WEATHER: Record<MonthSlug, string> = {
  november: "November",
  december: "December",
  january: "January",
  february: "February",
  march: "March",
  april: "April",
};

function discoverTypeLabel(
  type: string,
  tDetail: Awaited<ReturnType<typeof getTranslations>>
): string {
  if (type === "winery") return tDetail("metadata.typeWinery");
  if (type === "restaurant") return tDetail("metadata.typeEat");
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function trailDifficultyLabel(
  difficulty: string,
  tBadges: Awaited<ReturnType<typeof getTranslations>>
): string {
  const key = difficulty.toLowerCase();
  if (key === "easy" || key === "moderate" || key === "hard" || key === "expert") {
    return tBadges(`difficulty.${key}.label`);
  }
  return difficulty;
}

export async function discoverDetailMetadata(id: string, locale: string): Promise<Metadata> {
  const found = getDiscoverPlaceById(id);
  if (!found) notFound();
  // Overlay before building the snippet — covered places (wineries,
  // attractions, restaurants) otherwise splice their EN description into a
  // localized SERP frame.
  const a = await localizeDiscoverContent(found, locale);
  const tDiscoverDetail = await getTranslations({ locale, namespace: "discover.detail" });
  const typeLabel = discoverTypeLabel(a.type, tDiscoverDetail);
  const prefix = `${a.region}. ${typeLabel}. `;
  const maxDesc = 154 - prefix.length;
  const desc = a.description.slice(0, maxDesc).trim();
  const snippet = prefix + desc + (a.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getAttractionImage(a.id, a.type));
  const path = `/discover/${id}`;
  const base: Metadata = {
    title: `${a.name} | Cyprus Winter`,
    description: snippet,
    openGraph: {
      type: "article",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: tDiscoverDetail("imageAlt", { name: a.name, region: a.region, type: typeLabel }),
      }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function trailDetailMetadata(id: string, locale: string): Promise<Metadata> {
  const trail = findTrailByIdOrSlug(id);
  if (!trail) notFound();
  const [tTrailDetail, tBadges, tTrails] = await Promise.all([
    getTranslations({ locale, namespace: "trails.detail" }),
    getTranslations({ locale, namespace: "trails.badges" }),
    getTranslations({ locale, namespace: "trails" }),
  ]);
  const loc = trail.locationText ?? trail.region;
  const difficultyLabel = trailDifficultyLabel(trail.difficulty, tBadges);
  const prefix = tTrailDetail("meta.descriptionPrefix", {
    location: loc,
    lengthKm: trail.lengthKm,
    difficulty: difficultyLabel,
  });
  const maxDesc = 154 - prefix.length;
  const desc = trail.description.slice(0, maxDesc).trim() + (trail.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getTrailImage(trail.id));
  const path = `/trails/${trail.id}`;
  const base: Metadata = {
    title: tTrailDetail("meta.title", { name: trail.name }),
    description: prefix + desc,
    openGraph: {
      type: "article",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: tTrails("card.imageAlt", {
          name: trail.name,
          region: trail.region,
          length: trail.lengthKm,
          difficulty: trail.difficulty,
        }),
      }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function bookWineryMetadata(id: string, locale: string): Promise<Metadata> {
  const winery = wineries.find((w) => w.id === id);
  if (!winery) notFound();
  const t = await getTranslations({ locale, namespace: "book.pages.wineryDetail" });
  const path = `/book/winery/${id}`;
  const base: Metadata = {
    title: t("meta.title", { wineryName: winery.name }),
    description: t("meta.description", { wineryName: winery.name, region: winery.region }),
    // Book pages are texted/DMed ("book this one?") — they need a real share
    // card (AUD E2-05); this locale builder is the one that actually serves.
    openGraph: {
      title: t("meta.title", { wineryName: winery.name }),
      description: t("meta.description", { wineryName: winery.name, region: winery.region }),
      type: "website",
      images: [{
        url: toAbsoluteUrl(getAttractionImage(id, "winery")),
        width: 1200,
        height: 630,
        alt: winery.name,
      }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function bookGuideMetadata(id: string, locale: string): Promise<Metadata> {
  const guide = guides.find((g) => g.id === id);
  if (!guide) notFound();
  const t = await getTranslations({ locale, namespace: "book.pages.guideDetail" });
  const path = `/book/guide/${id}`;
  const base: Metadata = {
    title: t("meta.title", { guideName: guide.name }),
    description: t("meta.description", { guideName: guide.name, region: guide.region }),
    openGraph: {
      title: t("meta.title", { guideName: guide.name }),
      description: t("meta.description", { guideName: guide.name, region: guide.region }),
      type: "website",
      ...(guide.image ? { images: [{ url: toAbsoluteUrl(guide.image), width: 1200, height: 630, alt: guide.name }] } : {}),
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function regionSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const config = REGION_CONFIGS.find((c) => c.slug === slug);
  if (!config) notFound();
  const t = await getTranslations({ locale, namespace: "regions.page" });
  const path = `/regions/${slug}`;
  const base: Metadata = {
    title: `${t(`regions.${slug}.title`)} | Cyprus Winter`,
    // EN pages keep the keyword-dense regions.ts copy for search snippets;
    // non-EN pages get the localized intro instead of English (AUD-69).
    description: locale === "en" ? config.description : t(`regions.${slug}.intro`),
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function wineRouteSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const baseRoute = WINE_ROUTES.find((r) => r.slug === slug);
  if (!baseRoute) notFound();
  // Localize the title before it splices into the localized ICU frames —
  // route names are Greek place-words that take native forms on el/he.
  const route = await localizeWineRoute(baseRoute, locale);
  // Combined labels ("Laona–Akamas") count on both routes (AUD-71); localized
  // via the same keys the page uses instead of hardcoded EN.
  const count = wineriesForRoute(slug).length;
  const t = await getTranslations({ locale, namespace: "wineRoutes.page" });
  const path = `/wine-routes/${slug}`;
  const base: Metadata = {
    title: t("meta.title", { route: route.title }),
    description: t("meta.description", { route: route.title, count }),
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function weatherMonthMetadata(month: string, locale: string): Promise<Metadata> {
  const slug = month.toLowerCase() as MonthSlug;
  if (!MONTH_SLUGS.includes(slug)) notFound();

  const monthName = SLUG_TO_WEATHER[slug];
  const baseRow = weatherByMonth.find((r) => r.month === monthName);
  if (!baseRow) notFound();
  // Localize the spliced coastDesc so the SERP snippet is single-language.
  const row = await localizeWeatherRow(baseRow, locale);

  const tWeatherMonth = await getTranslations({ locale, namespace: "weather.month" });
  const monthLabel = tWeatherMonth(`monthNames.${slug}` as "monthNames.december");
  const coastRange = `${row.coastMinC}–${row.coastMaxC}°C`;
  const troodosRange = `${row.troodosMinC}–${row.troodosMaxC}°C`;
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

  const path = `/weather/${slug}`;
  const base: Metadata = {
    title: tWeatherMonth("meta.title", { month: monthLabel }),
    description: tWeatherMonth("meta.description", {
      month: monthLabel,
      coastRange,
      troodosRange,
      coastDesc: row.coastDesc,
    }),
    openGraph: {
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: tWeatherMonth("meta.ogImageAlt", { month: monthLabel }),
      }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}
