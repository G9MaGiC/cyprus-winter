import type { Metadata } from "next";
import { getDiscoverPlaceById } from "@/data";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { REGION_CONFIGS } from "@/data/regions";
import { WINE_ROUTES } from "@/data/wine-routes";
import { weatherByMonth } from "@/data/weather";
import { getAttractionImage } from "@/lib/cyprus-images";
import { getTrailImage } from "@/lib/cyprus-images";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
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

export async function discoverDetailMetadata(id: string, locale: string): Promise<Metadata> {
  const a = getDiscoverPlaceById(id);
  if (!a) return { title: "Not found" };
  const typeLabel =
    a.type === "winery" ? "Winery" : a.type === "restaurant" ? "Eat" : a.type.charAt(0).toUpperCase() + a.type.slice(1);
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
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${a.name}, ${a.region}—Cyprus winter` }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function trailDetailMetadata(id: string, locale: string): Promise<Metadata> {
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) return { title: "Not found" };
  const loc = trail.locationText ?? trail.region;
  const prefix = `${loc}. ${trail.lengthKm} km, ${trail.difficulty}. `;
  const maxDesc = 154 - prefix.length;
  const desc = trail.description.slice(0, maxDesc).trim() + (trail.description.length > maxDesc ? "…" : "");
  const imageUrl = toAbsoluteUrl(getTrailImage(trail.id));
  const path = `/trails/${id}`;
  const base: Metadata = {
    title: `${trail.name} | Cyprus Winter Trails`,
    description: prefix + desc,
    openGraph: {
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${trail.name}, ${trail.region} — ${trail.lengthKm} km trail in Cyprus winter` }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function bookWineryMetadata(id: string, locale: string): Promise<Metadata> {
  const winery = wineries.find((w) => w.id === id);
  if (!winery) return { title: "Not found" };
  const path = `/book/winery/${id}`;
  const base: Metadata = {
    title: `Book a tasting | ${winery.name} | Cyprus Winter`,
    description: `Book a winter tasting at ${winery.name} in ${winery.region}. Cosy fires, heaters, often the owner pouring. They'll confirm by email. Book ahead. Cyprus Winter.`,
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function bookGuideMetadata(id: string, locale: string): Promise<Metadata> {
  const guide = guides.find((g) => g.id === id);
  if (!guide) return { title: "Not found" };
  const path = `/book/guide/${id}`;
  const base: Metadata = {
    title: `Book a guided hike | ${guide.name} | Cyprus Winter`,
    description: `Request a guided winter hike with ${guide.name} in ${guide.region}. Small groups, local expertise. They'll confirm by email.`,
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function regionSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const config = REGION_CONFIGS.find((c) => c.slug === slug);
  if (!config) {
    const base: Metadata = {
      title: "Region not found | Cyprus Winter",
      description:
        "Cyprus winter regions: Troodos, Paphos, Ayia Napa, Larnaca, Limassol. Explore trails, wineries, and villages.",
    };
    return applyLocaleToMetadata(base, `/regions/${slug}`, locale);
  }
  const path = `/regions/${slug}`;
  const base: Metadata = {
    title: `${config.title} | Cyprus Winter`,
    description: config.description,
  };
  return applyLocaleToMetadata(base, path, locale);
}

export async function wineRouteSlugMetadata(slug: string, locale: string): Promise<Metadata> {
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route) {
    const base: Metadata = {
      title: "Wine route not found | Cyprus Winter",
      description: "Cyprus winter wine routes: Krasochoria, Laona, Akamas, Commandaria. Browse wineries for winter tastings.",
    };
    return applyLocaleToMetadata(base, `/wine-routes/${slug}`, locale);
  }
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
  if (!MONTH_SLUGS.includes(slug)) {
    const base: Metadata = {
      title: "Weather not found | Cyprus Winter",
      description: "Cyprus winter weather by month: December, January, February, March. Coast and Troodos temperatures.",
    };
    return applyLocaleToMetadata(base, `/weather/${month}`, locale);
  }

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  if (!row) {
    const base: Metadata = {
      title: "Weather not found | Cyprus Winter",
      description: "Cyprus winter weather by month. Plan trails and wineries.",
    };
    return applyLocaleToMetadata(base, `/weather/${slug}`, locale);
  }

  const coastRange = `${row.coastMinC}–${row.coastMaxC}°C`;
  const troodosRange = `${row.troodosMinC}–${row.troodosMaxC}°C`;
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

  const path = `/weather/${slug}`;
  const base: Metadata = {
    title: `Cyprus Winter Weather ${monthName} | Coast & Troodos`,
    description: `Cyprus winter weather ${monthName}: coast ${coastRange}, Troodos ${troodosRange}. ${row.coastDesc} Plan trails, wineries, and winter events.`,
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Cyprus winter coast—${monthName} weather` }],
    },
  };
  return applyLocaleToMetadata(base, path, locale);
}
