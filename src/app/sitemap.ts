/**
 * Sitemap lists canonical (default-locale, unprefixed) URLs only — see docs/INTERNATIONAL_SEO.md (Strategy A).
 */
import type { MetadataRoute } from "next";
import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { REGION_CONFIGS } from "@/data/regions";
import { WINE_ROUTES } from "@/data/wine-routes";
import { ACTIVITY_FILTER_KEYS } from "@/lib/activity-catalog";
import { DISCOVER_SECTION_FILTER_KEYS } from "@/lib/discover-list-meta";
import { SITE_URL } from "@/lib/site-url";

const WEATHER_MONTH_SLUGS = ["november", "december", "january", "february", "march", "april"] as const;

export const dynamic = "force-static";

type ChangeFreq = "daily" | "weekly" | "monthly";

function entry(
  base: string,
  path: string,
  priority: number,
  changeFreq: ChangeFreq = "weekly",
  lastModified: string
): MetadataRoute.Sitemap[number] {
  return {
    url: `${base}${path}`,
    changeFrequency: changeFreq,
    priority,
    lastModified,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date().toISOString();
  const e = (path: string, priority: number, changeFreq?: ChangeFreq) =>
    entry(base, path, priority, changeFreq, now);

  const discoverActivityFilters: MetadataRoute.Sitemap = ACTIVITY_FILTER_KEYS.map(
    (filter) => entry(base, `/discover?filter=${filter}`, 0.75, "weekly", now)
  );

  const discoverSectionFilters: MetadataRoute.Sitemap =
    DISCOVER_SECTION_FILTER_KEYS.map((filter) =>
      entry(base, `/discover?filter=${filter}`, 0.78, "weekly", now)
    );

  const hub: MetadataRoute.Sitemap = [
    e("/", 1),
    e("/discover", 0.9),
    ...discoverSectionFilters,
    ...discoverActivityFilters,
    e("/trails", 0.9, "daily"),
    e("/plan", 0.8, "monthly"),
    e("/events", 0.8),
    e("/book/winery", 0.65, "monthly"),
  ];

  const secondary: MetadataRoute.Sitemap = [
    e("/weather", 0.8, "monthly"),
    e("/airport", 0.7, "monthly"),
    e("/search", 0.7, "monthly"),
    e("/secrets", 0.8),
  ];

  const discoverSections: MetadataRoute.Sitemap = [
    e("/beaches", 0.8),
    e("/wineries", 0.8),
    e("/villages", 0.8),
    e("/cycling", 0.8),
    e("/nature", 0.8),
    e("/wine-routes", 0.8),
  ];

  const regions: MetadataRoute.Sitemap = REGION_CONFIGS.map((c) =>
    entry(base, `/regions/${c.slug}`, 0.8, "weekly", now)
  );

  const weatherMonths: MetadataRoute.Sitemap = [
    ...WEATHER_MONTH_SLUGS.map((slug) =>
      entry(base, `/weather/${slug}`, 0.7, "monthly", now)
    ),
  ];

  const wineRoutes: MetadataRoute.Sitemap = WINE_ROUTES.map((r) =>
    entry(base, `/wine-routes/${r.slug}`, 0.7, "monthly", now)
  );

  const support: MetadataRoute.Sitemap = [
    e("/team", 0.5, "monthly"),
    e("/partner/join", 0.4, "monthly"),
    e("/guides/directory", 0.65),
    e("/guides/troodos-december", 0.7),
    e("/privacy", 0.3, "monthly"),
    e("/terms", 0.3, "monthly"),
  ];

  const discoverIds = [
    ...new Set([...allAttractions.map((a) => a.id), ...restaurants.map((r) => r.id)]),
  ];
  const discoverPages: MetadataRoute.Sitemap = discoverIds.map((id) =>
    entry(base, `/discover/${id}`, 0.8, "weekly", now)
  );

  const trailPages: MetadataRoute.Sitemap = trails.map((t) =>
    entry(base, `/trails/${t.id}`, 0.8, "daily", now)
  );
  // Canonical trail URLs use `id` (see trails/[id]/page.tsx); slug aliases are SSG-only, not listed here.

  const wineryBookingPages: MetadataRoute.Sitemap = wineries.map((w) =>
    entry(base, `/book/winery/${w.id}`, 0.6, "monthly", now)
  );

  const guideBookingPages: MetadataRoute.Sitemap = [
    entry(base, "/book/guide", 0.6, "monthly", now),
    ...guides.map((g) => entry(base, `/book/guide/${g.id}`, 0.6, "monthly", now)),
  ];

  return [
    ...hub,
    ...secondary,
    ...discoverSections,
    ...regions,
    ...weatherMonths,
    ...wineRoutes,
    ...support,
    ...discoverPages,
    ...trailPages,
    ...wineryBookingPages,
    ...guideBookingPages,
  ];
}
