import { MetadataRoute } from "next";
import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly" as const, priority: 1, lastModified: now },
    { url: `${base}/discover`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${base}/trails`, changeFrequency: "daily" as const, priority: 0.9, lastModified: now },
    { url: `${base}/events`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/plan`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/airport`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/search`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/secrets`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/beaches`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/wineries`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/weather`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/villages`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/weather/december`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/january`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/february`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/weather/march`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/regions/troodos`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/paphos`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/ayia-napa`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/larnaca`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/regions/limassol`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${base}/wine-routes/krasochoria`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/laona`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/akamas`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/wine-routes/commandaria`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/guides/troodos-december`, changeFrequency: "weekly" as const, priority: 0.7, lastModified: now },
    { url: `${base}/team`, changeFrequency: "monthly" as const, priority: 0.5, lastModified: now },
    { url: `${base}/bookings`, changeFrequency: "monthly" as const, priority: 0.6, lastModified: now },
    { url: `${base}/install`, changeFrequency: "monthly" as const, priority: 0.4, lastModified: now },
  ];

  const discoverPages: MetadataRoute.Sitemap = allAttractions.map((a) => ({
    url: `${base}/discover/${a.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: now,
  }));

  const restaurantPages: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${base}/discover/${r.id}`,
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

  return [
    ...staticPages,
    ...discoverPages,
    ...restaurantPages,
    ...trailPages,
    ...wineryBookingPages,
  ];
}
