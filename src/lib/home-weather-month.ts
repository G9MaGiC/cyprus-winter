import { weatherByMonth } from "@/data/weather";

export const MONTH_TO_WEATHER: Record<number, number> = {
  0: 2,
  1: 3,
  2: 4,
  3: 5,
  10: 0,
  11: 1,
};

export function getWeatherRowForCurrentMonth(): (typeof weatherByMonth)[number] {
  return weatherByMonth[MONTH_TO_WEATHER[new Date().getMonth()] ?? 1];
}

export function getWeatherPromptKey(
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
