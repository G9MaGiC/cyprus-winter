import "server-only";

import { getLiveWeather } from "@/lib/weather-live";
import { getWeatherPromptKey, getWeatherRowForCurrentMonth } from "@/lib/home-weather-month";
import { getTranslations } from "next-intl/server";
import type { HomeWeatherStripViewProps } from "@/app/_home/HomeWeatherStripView";

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

  const w = getWeatherRowForCurrentMonth();
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
