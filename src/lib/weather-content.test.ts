import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { weatherByMonth } from "@/data/weather";
import { LOCALIZED_WEATHER_FIELDS } from "@/lib/weather-content";

/**
 * Guard for the weather-month overlay — mirrors secret-gem-content.test.ts:
 * the class is covered whole, so the catalog's month set must equal the
 * data's month set exactly, every field must be non-empty in all 7 locales,
 * and EN must mirror src/data/weather.ts verbatim (single source of truth
 * stays in data).
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function weatherNs(locale: string): Record<string, Record<string, string>> {
  const ns = (
    loadCatalog(locale) as { data?: { weather?: Record<string, Record<string, string>> } }
  ).data?.weather;
  expect(ns, `${locale}: data.weather namespace missing`).toBeTruthy();
  return ns as Record<string, Record<string, string>>;
}

const dataSlugs = weatherByMonth.map((r) => r.month.toLowerCase());

describe("weather content overlay (data-layer arc, class 1)", () => {
  it("catalog months equal the data months exactly (a new month must ship with coverage)", () => {
    for (const locale of LOCALES) {
      expect(new Set(Object.keys(weatherNs(locale)))).toEqual(new Set(dataSlugs));
    }
  });

  for (const locale of LOCALES) {
    it(`every field has a non-empty ${locale} catalog string`, () => {
      const ns = weatherNs(locale);
      for (const slug of dataSlugs) {
        for (const field of LOCALIZED_WEATHER_FIELDS) {
          const value = ns[slug]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.weather.${slug}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = weatherNs("en");
    for (const row of weatherByMonth) {
      const slug = row.month.toLowerCase();
      for (const field of LOCALIZED_WEATHER_FIELDS) {
        expect(ns[slug]?.[field], `en: data.weather.${slug}.${field}`).toBe(row[field]);
      }
    }
  });
});
