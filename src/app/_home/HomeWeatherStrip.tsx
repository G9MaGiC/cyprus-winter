import { Link } from "@/i18n/navigation";
import { weatherByMonth } from "@/data/weather";
import { LAYOUT, STRIP } from "@/lib/design-tokens";
import { getLiveWeather } from "@/lib/weather-live";

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
function getWeatherPrompt(w: (typeof weatherByMonth)[number]): string {
  const m = w.month.toLowerCase();
  if (m.includes("nov")) return "Trails clear. Best for hiking.";
  if (m.includes("dec")) return "Check trail conditions before Troodos.";
  if (m.includes("jan")) return "Pack layers. Wineries warm inside.";
  if (m.includes("feb")) return "Ski season continues. Pack microspikes for higher trails.";
  if (m.includes("mar")) return "Best hiking month. Trails open.";
  if (m.includes("apr")) return "All trails open. Spring clarity.";
  return "Pack layers for the mountain.";
}

export default async function HomeWeatherStrip() {
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
  const prompt = getWeatherPrompt(w);

  return (
    <section
      aria-labelledby="home-weather-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-sand/60 border-b border-sand-200/80`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <Link
          href="/weather"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center min-h-[44px] py-2"
          aria-label="Cyprus winter weather — Coast and Troodos temperatures. Check weather."
        >
          <span id="home-weather-heading" className="font-display font-semibold text-olive">
            {coastMid}°C coast · {troodosMid}°C Troodos
          </span>
          <span className="text-sage text-sm">— {prompt}</span>
        </Link>
      </div>
    </section>
  );
}
