import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDiscoverPlaceById } from "@/data";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { REGION_CONFIGS } from "@/data/regions";
import { WINE_ROUTES } from "@/data/wine-routes";
import { weatherByMonth } from "@/data/weather";
import { getAttractionImage } from "@/lib/cyprus-images";
import { getTrailImage } from "@/lib/cyprus-images";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";
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
  tFilters: Awaited<ReturnType<typeof getTranslations>>
): string {
  const key = difficulty.toLowerCase();
  if (key === "easy" || key === "moderate" || key === "hard" || key === "expert") {
    return tFilters(`difficulty.${key}.label`);
  }
  return difficulty;
}

export async function discoverDetailMetadata(id: string, locale: string): Promise<Metadata> {
  const a = getDiscoverPlaceById(id);
  if (!a) notFound();
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
  const [tTrailDetail, tFilters, tTrails] = await Promise.all([
    getTranslations({ locale, namespace: "trails.detail" }),
    getTranslations({ locale, namespace: "trails.filters" }),
    getTranslations({ locale, namespace: "trails" }),
  ]);
  const loc = trail.locationText ?? trail.region;
  const difficultyLabel = trailDifficultyLabel(trail.difficulty, tFilters);
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
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function regionSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const config = REGION_CONFIGS.find((c) => c.slug === slug);
  if (!config) notFound();
  const path = `/regions/${slug}`;
  const base: Metadata = {
    title: `${config.title} | Cyprus Winter`,
    description: config.description,
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function wineRouteSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route) notFound();
  const count = wineries.filter((w) => w.wineRoute?.toLowerCase() === slug).length;
  const path = `/wine-routes/${slug}`;
  const base: Metadata = {
    title: `${route.title} Wine Route Cyprus Winter | Wineries & Tastings`,
    description: `${route.description} ${count} wineries open for winter tastings. Book ahead.`,
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function weatherMonthMetadata(month: string, locale: string): Promise<Metadata> {
  const slug = month.toLowerCase() as MonthSlug;
  if (!MONTH_SLUGS.includes(slug)) notFound();

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  if (!row) notFound();

  const tWeatherMonth = await getTranslations({ locale, namespace: "weather.month" });
  const coastRange = `${row.coastMinC}–${row.coastMaxC}°C`;
  const troodosRange = `${row.troodosMinC}–${row.troodosMaxC}°C`;
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

  const path = `/weather/${slug}`;
  const base: Metadata = {
    title: tWeatherMonth("meta.title", { month: monthName }),
    description: tWeatherMonth("meta.description", {
      month: monthName,
      coastRange,
      troodosRange,
      coastDesc: row.coastDesc,
    }),
    openGraph: {
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: tWeatherMonth("meta.ogImageAlt", { month: monthName }),
      }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}
