import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { airports } from "@/data/airport";
import { transportSlug } from "@/lib/airport-content";

/**
 * Guard for the arrival-guide overlay — mirrors weather-content.test.ts: the
 * class is covered whole, so the catalog structure must equal the data
 * structure exactly (codes, transport slugs, tip counts, optional fields),
 * every string must be non-empty in all 7 locales, and EN must mirror
 * src/data/airport.ts verbatim. This is the app's highest-stakes prose
 * (costs, driving side, emergency numbers) — nothing may drift or go empty.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

type TransportNs = Record<string, Record<string, string>>;
type AirportNs = { city: string; transport: TransportNs; tips: Record<string, string> };

function airportNs(locale: string): Record<string, AirportNs> {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../messages", `${locale}.json`), "utf8")
  ) as { data?: { airport?: Record<string, AirportNs> } };
  expect(catalog.data?.airport, `${locale}: data.airport namespace missing`).toBeTruthy();
  return catalog.data!.airport!;
}

describe("airport content overlay (data-layer arc, class 2)", () => {
  it("catalog structure equals the data structure exactly, in every locale", () => {
    for (const locale of LOCALES) {
      const ns = airportNs(locale);
      expect(new Set(Object.keys(ns))).toEqual(new Set(airports.map((a) => a.code.toLowerCase())));
      for (const airport of airports) {
        const entry = ns[airport.code.toLowerCase()];
        expect(new Set(Object.keys(entry.transport))).toEqual(
          new Set(airport.transport.map((opt) => transportSlug(opt.type)))
        );
        expect(new Set(Object.keys(entry.tips))).toEqual(
          new Set(airport.tips.map((_, i) => String(i)))
        );
        for (const opt of airport.transport) {
          const fields = new Set(Object.keys(entry.transport[transportSlug(opt.type)]));
          const expected = new Set(["type", "description", "approxCost"]);
          if (opt.duration) expected.add("duration");
          if (opt.tip) expected.add("tip");
          expect(fields, `${locale}: ${airport.code}/${opt.type} fields`).toEqual(expected);
        }
      }
    }
  });

  for (const locale of LOCALES) {
    it(`every field is a non-empty ${locale} string`, () => {
      const ns = airportNs(locale);
      const check = (value: unknown, label: string) => {
        expect(
          typeof value === "string" && value.trim().length > 0,
          `${locale}: ${label} missing or empty`
        ).toBe(true);
      };
      for (const airport of airports) {
        const code = airport.code.toLowerCase();
        const entry = ns[code];
        check(entry.city, `data.airport.${code}.city`);
        for (const opt of airport.transport) {
          const slug = transportSlug(opt.type);
          for (const field of Object.keys(entry.transport[slug])) {
            check(entry.transport[slug][field], `data.airport.${code}.transport.${slug}.${field}`);
          }
        }
        airport.tips.forEach((_, i) => check(entry.tips[String(i)], `data.airport.${code}.tips.${i}`));
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = airportNs("en");
    for (const airport of airports) {
      const entry = ns[airport.code.toLowerCase()];
      expect(entry.city).toBe(airport.city);
      for (const opt of airport.transport) {
        const slug = transportSlug(opt.type);
        expect(entry.transport[slug].type).toBe(opt.type);
        expect(entry.transport[slug].description).toBe(opt.description);
        expect(entry.transport[slug].approxCost).toBe(opt.approxCost);
        if (opt.duration) expect(entry.transport[slug].duration).toBe(opt.duration);
        if (opt.tip) expect(entry.transport[slug].tip).toBe(opt.tip);
      }
      airport.tips.forEach((tip, i) => expect(entry.tips[String(i)]).toBe(tip));
    }
  });
});
