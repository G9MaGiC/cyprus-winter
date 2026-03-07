import { MetadataRoute } from "next";
import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date().toISOString();

  // Core — homepage, main hubs
  const corePages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly" as const, priority: 1, lastModified: now },
    { url: `${base}/discover`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${base}/trails`, changeFrequency: "daily" as const, priority: 0.9, lastModified: now },
    { url: `${base}/events`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/plan`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/search`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/airport`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/bookings`, changeFrequency: "monthly" as const, priority: 0.6, lastModified: now },
  ];

  // Discover sections — beaches, wineries, villages, secrets
  const discoverSectionPages: MetadataRoute.Sitemap = [
    { url: `${base}/secrets`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/beaches`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/wineries`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/villages`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
  ];

  // Weather — index + monthly
  const weatherPages: MetadataRoute.Sitemap = [
    { url: `${base}/weather`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/weather/december`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/january`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/february`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/march`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
  ];

  // Regions
  const regionPages: MetadataRoute.Sitemap = [
    { url: `${base}/regions/troodos`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/paphos`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/ayia-napa`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/larnaca`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/limassol`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
  ];

  // Wine routes
  const wineRoutePages: MetadataRoute.Sitemap = [
    { url: `${base}/wine-routes/krasochoria`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/laona`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/akamas`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/commandaria`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
  ];

  // Guides, team, install
  const miscPages: MetadataRoute.Sitemap = [
    { url: `${base}/guides/troodos-december`, changeFrequency: "weekly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/team`, changeFrequency: "monthly" as const, priority: 0.5, lastModified: now },
    { url: `${base}/install`, changeFrequency: "monthly" as const, priority: 0.4, lastModified: now },
  ];

  const staticPages = [...corePages, ...discoverSectionPages, ...weatherPages, ...regionPages, ...wineRoutePages, ...miscPages];

  // Discover detail pages — attractions + restaurants (all resolve at /discover/[id])
  const discoverIds = [...new Set([
    ...allAttractions.map((a) => a.id),
    ...restaurants.map((r) => r.id),
  ])];
  const discoverPages: MetadataRoute.Sitemap = discoverIds.map((id) => ({
    url: `${base}/discover/${id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: now,
  }));

  const trailPages: MetadataRoute.Sitemap = trails.map((t) => ({
    url: `${base}/trails/${t.id}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
    lastModified: now,
  }));

  const wineryBookingPages: MetadataRoute.Sitemap = wineries.map((w) => ({
    url: `${base}/book/winery/${w.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));

  const guideBookingPages: MetadataRoute.Sitemap = [
    { url: `${base}/book/guide`, changeFrequency: "monthly" as const, priority: 0.6, lastModified: now },
    ...guides.map((g) => ({
      url: `${base}/book/guide/${g.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: now,
    })),
  ];

  return [
    ...staticPages,
    ...discoverPages,
    ...trailPages,
    ...wineryBookingPages,
    ...guideBookingPages,
  ];
}
