import "server-only";
import { getTranslations } from "next-intl/server";
import type { WeatherByMonth } from "@/data/weather";

/**
 * BUG-110 message-overlay pattern for the weather month descriptions — the
 * first class of the data-layer arc batch 56 named: per-locale copy lives in
 * messages under `data.weather.{slug}.{field}` (slug = lower-cased month)
 * and is overlaid onto the base TS record at render. Coverage is the whole
 * class from day one — all six months carry catalog keys in all 7 locales
 * (guarded by weather-content.test.ts). Temperatures stay numeric fields on
 * the record; only the two prose descriptions localize.
 */

export const LOCALIZED_WEATHER_FIELDS = ["coastDesc", "troodosDesc"] as const;
export type LocalizedWeatherField = (typeof LOCALIZED_WEATHER_FIELDS)[number];

const monthSlug = (month: string) => month.toLowerCase();

export async function localizeWeatherRow(
  row: WeatherByMonth,
  locale?: string
): Promise<WeatherByMonth> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.weather" })
    : await getTranslations("data.weather");
  const overlaid: Record<string, string> = {};
  for (const field of LOCALIZED_WEATHER_FIELDS) {
    overlaid[field] = t(`${monthSlug(row.month)}.${field}`);
  }
  return { ...row, ...overlaid };
}

export async function localizeWeatherByMonth(
  rows: WeatherByMonth[],
  locale?: string
): Promise<WeatherByMonth[]> {
  return Promise.all(rows.map((row) => localizeWeatherRow(row, locale)));
}
