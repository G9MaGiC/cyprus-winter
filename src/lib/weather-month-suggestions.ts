export const MONTH_SLUGS = ["november", "december", "january", "february", "march", "april"] as const;
export type MonthSlug = (typeof MONTH_SLUGS)[number];

export type WeatherDiscoveryKey = "trails" | "wineries" | "villages" | "monasteries" | "secrets";

export type WeatherMonthDiscoveryLink = {
  key: WeatherDiscoveryKey;
  href: string;
};

/**
 * Deterministic, static suggestions for what to browse during a given month.
 * No network calls; safe to use in Server Components.
 */
export function getWeatherMonthDiscovery(slug: MonthSlug): WeatherMonthDiscoveryLink[] {
  const presets: Record<MonthSlug, WeatherMonthDiscoveryLink[]> = {
    november: [
      { key: "villages", href: "/discover?filter=village" },
      { key: "monasteries", href: "/discover?filter=monastery" },
      { key: "secrets", href: "/discover?filter=hidden" },
    ],
    december: [
      { key: "monasteries", href: "/discover?filter=monastery" },
      { key: "wineries", href: "/discover?filter=winery" },
      { key: "villages", href: "/discover?filter=village" },
    ],
    january: [
      { key: "wineries", href: "/discover?filter=winery" },
      { key: "monasteries", href: "/discover?filter=monastery" },
      { key: "secrets", href: "/discover?filter=hidden" },
    ],
    february: [
      { key: "secrets", href: "/discover?filter=hidden" },
      { key: "villages", href: "/discover?filter=village" },
      { key: "monasteries", href: "/discover?filter=monastery" },
    ],
    march: [
      { key: "trails", href: "/trails" },
      { key: "villages", href: "/discover?filter=village" },
      { key: "wineries", href: "/discover?filter=winery" },
    ],
    april: [
      { key: "trails", href: "/trails" },
      { key: "villages", href: "/discover?filter=village" },
      { key: "secrets", href: "/discover?filter=hidden" },
    ],
  };

  return presets[slug];
}

