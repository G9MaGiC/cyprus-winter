import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { restaurants } from "@/data/restaurants";
import {
  LOCALIZED_RESTAURANT_FIELDS,
  LOCALIZED_RESTAURANT_IDS,
} from "@/lib/restaurant-content-ids";

/**
 * Guard for the restaurant overlay — mirrors event-content.test.ts:
 * registry, data and all 7 catalogs must cover exactly the same ids (the
 * class is complete — a new restaurant must ship with coverage), each
 * covered id must carry a catalog key exactly where the base record has
 * the field, every value must be non-empty in all 7 catalogs, and EN must
 * mirror the base record verbatim.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function restaurantsNs(locale: string): Record<string, Record<string, string>> {
  const ns = (
    loadCatalog(locale) as {
      data?: { restaurants?: Record<string, Record<string, string>> };
    }
  ).data?.restaurants;
  expect(ns, `${locale}: data.restaurants namespace missing`).toBeTruthy();
  return ns as Record<string, Record<string, string>>;
}

describe("restaurant content overlay (data-layer arc, class 7)", () => {
  it("registry, data and catalogs cover exactly the same ids (the class is complete — a new restaurant must ship with coverage)", () => {
    expect(new Set(restaurants.map((r) => r.id))).toEqual(LOCALIZED_RESTAURANT_IDS);
    for (const locale of LOCALES) {
      expect(new Set(Object.keys(restaurantsNs(locale)))).toEqual(
        LOCALIZED_RESTAURANT_IDS
      );
    }
  });

  for (const locale of LOCALES) {
    it(`every covered id has keys exactly where the base has fields, all non-empty (${locale})`, () => {
      const ns = restaurantsNs(locale);
      for (const restaurant of restaurants) {
        if (!LOCALIZED_RESTAURANT_IDS.has(restaurant.id)) continue;
        for (const field of LOCALIZED_RESTAURANT_FIELDS) {
          const value = ns[restaurant.id]?.[field];
          if (!restaurant[field]) {
            expect(
              value,
              `${locale}: data.restaurants.${restaurant.id}.${field} has no base field`
            ).toBeUndefined();
            continue;
          }
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.restaurants.${restaurant.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim", () => {
    const ns = restaurantsNs("en");
    for (const restaurant of restaurants) {
      if (!LOCALIZED_RESTAURANT_IDS.has(restaurant.id)) continue;
      for (const field of LOCALIZED_RESTAURANT_FIELDS) {
        if (!restaurant[field]) continue;
        expect(
          ns[restaurant.id]?.[field],
          `en: data.restaurants.${restaurant.id}.${field}`
        ).toBe(restaurant[field]);
      }
    }
  });
});
