import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { allAttractions } from "@/data";
import {
  LOCALIZED_ATTRACTION_FIELDS,
  LOCALIZED_ATTRACTION_IDS,
} from "@/lib/attraction-content-ids";
import { LOCALIZED_WINERY_IDS } from "@/lib/winery-content-ids";

/**
 * Guard for the AUD-10 attraction overlay (slice 3) — mirrors
 * winery-content.test.ts: every covered attraction × every covered field the
 * base record populates must have a non-empty catalog string in all 7
 * locales, or the overlay would render a raw key on a decision surface.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

describe("attraction content overlay (AUD-10 slice 3)", () => {
  it("covers only ids that exist in the data, none overlapping the winery set", () => {
    for (const id of LOCALIZED_ATTRACTION_IDS) {
      expect(
        allAttractions.some((a) => a.id === id),
        `LOCALIZED_ATTRACTION_IDS contains unknown attraction id ${id}`
      ).toBe(true);
      // Disjoint sets keep localizeDiscoverContent's dispatch unambiguous.
      expect(LOCALIZED_WINERY_IDS.has(id), `${id} is in both overlay sets`).toBe(false);
    }
  });

  for (const locale of LOCALES) {
    it(`every covered field has a non-empty ${locale} catalog string`, () => {
      const catalog = loadCatalog(locale);
      const ns = (
        catalog as { data?: { attractions?: Record<string, Record<string, string>> } }
      ).data?.attractions;
      expect(ns, `${locale}: data.attractions namespace missing`).toBeTruthy();
      for (const attraction of allAttractions) {
        if (!LOCALIZED_ATTRACTION_IDS.has(attraction.id)) continue;
        for (const field of LOCALIZED_ATTRACTION_FIELDS) {
          if (typeof attraction[field] !== "string") continue;
          const value = ns?.[attraction.id]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.attractions.${attraction.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = (
      loadCatalog("en") as { data: { attractions: Record<string, Record<string, string>> } }
    ).data.attractions;
    for (const attraction of allAttractions) {
      if (!LOCALIZED_ATTRACTION_IDS.has(attraction.id)) continue;
      for (const field of LOCALIZED_ATTRACTION_FIELDS) {
        const base = attraction[field];
        if (typeof base !== "string") continue;
        expect(ns[attraction.id][field], `en drift on ${attraction.id}.${field}`).toBe(base);
      }
    }
  });
});
