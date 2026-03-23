import type { ComponentType } from "react";
import { weatherByMonth } from "@/data/weather";
import { LAYOUT, STRIP, TYPE } from "@/lib/design-tokens";
import { getLiveWeather } from "@/lib/weather-live";
import type { LinkProps } from "@/app/_home/types";
import { getTranslations } from "next-intl/server";

const MONTH_TO_WEATHER: Record<number, number> = {
  0: 2,  // Jan -> January
  1: 3,  // Feb -> February
  2: 4,  // Mar -> March
  3: 5,  // Apr -> April
  10: 0, // Nov -> November
  11: 1, // Dec -> December
};

function getCurrentMonthWeather() {
  const m = new Date().getMonth();
  const idx = MONTH_TO_WEATHER[m] ?? 1; // default December for May–Oct
  return weatherByMonth[idx];
}

/** Short actionable prompt from current month. */
function getWeatherPromptKey(
  w: (typeof weatherByMonth)[number]
):
  | "november"
  | "december"
  | "january"
  | "february"
  | "march"
  | "april"
  | "fallback" {
  const m = w.month.toLowerCase();
  if (m.includes("nov")) return "november";
  if (m.includes("dec")) return "december";
  if (m.includes("jan")) return "january";
  if (m.includes("feb")) return "february";
  if (m.includes("mar")) return "march";
  if (m.includes("apr")) return "april";
  return "fallback";
}

export default async function HomeWeatherStrip({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const tHome = await getTranslations("home");
  const Link = LinkComponent;
  let live: Awaited<ReturnType<typeof getLiveWeather>> = null;
  try {
    live = await getLiveWeather();
  } catch {
    live = null;
  }
  const w = getCurrentMonthWeather();
  const coastMid = live
    ? Math.round((live.coast.minC + live.coast.maxC) / 2)
    : Math.round((w.coastMinC + w.coastMaxC) / 2);
  const troodosMid = live
    ? Math.round((live.troodos.minC + live.troodos.maxC) / 2)
    : Math.round((w.troodosMinC + w.troodosMaxC) / 2);
  const prompt = tHome(`weatherStrip.prompts.${getWeatherPromptKey(w)}`);

  return (
    <section
      aria-labelledby="home-weather-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-sand-100/80 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <Link
          href="/weather"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center min-h-[44px] py-2 group"
          aria-label={tHome("weatherStrip.aria")}
        >
          <span id="home-weather-heading" className={`${TYPE.cardTitle}`}>
            {tHome("weatherStrip.heading", {
              coast: coastMid,
              troodos: troodosMid,
            })}
          </span>
          <span className="text-sage text-sm">— {prompt}</span>
        </Link>
      </div>
    </section>
  );
}
