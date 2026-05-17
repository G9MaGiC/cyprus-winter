import "server-only";

import { weatherByMonth } from "@/data/weather";
import { getLiveWeather } from "@/lib/weather-live";
import { getTranslations } from "next-intl/server";
import type { HomeWeatherStripViewProps } from "@/app/_home/HomeWeatherStripView";

const MONTH_TO_WEATHER: Record<number, number> = {
  0: 2,
  1: 3,
  2: 4,
  3: 5,
  10: 0,
  11: 1,
};

function getWeatherPromptKey(
  w: (typeof weatherByMonth)[number]
): "november" | "december" | "january" | "february" | "march" | "april" | "fallback" {
  const m = w.month.toLowerCase();
  if (m.includes("nov")) return "november";
  if (m.includes("dec")) return "december";
  if (m.includes("jan")) return "january";
  if (m.includes("feb")) return "february";
  if (m.includes("mar")) return "march";
  if (m.includes("apr")) return "april";
  return "fallback";
}

export async function getHomeWeatherStripProps(locale?: string): Promise<HomeWeatherStripViewProps> {
  const tHome = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  let live: Awaited<ReturnType<typeof getLiveWeather>> = null;
  try {
    live = await getLiveWeather();
  } catch {
    live = null;
  }

  const m = new Date().getMonth();
  const w = weatherByMonth[MONTH_TO_WEATHER[m] ?? 1];
  const coastMid = live
    ? Math.round((live.coast.minC + live.coast.maxC) / 2)
    : Math.round((w.coastMinC + w.coastMaxC) / 2);
  const troodosMid = live
    ? Math.round((live.troodos.minC + live.troodos.maxC) / 2)
    : Math.round((w.troodosMinC + w.troodosMaxC) / 2);

  return {
    aria: tHome("weatherStrip.aria"),
    heading: tHome("weatherStrip.heading", { coast: coastMid, troodos: troodosMid }),
    prompt: tHome(`weatherStrip.prompts.${getWeatherPromptKey(w)}`),
  };
}
