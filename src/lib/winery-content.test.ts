import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { wineries } from "@/data/wineries";
import { LOCALIZED_WINERY_FIELDS, LOCALIZED_WINERY_IDS } from "@/lib/winery-content-ids";

/**
 * Guard for the AUD-10 pilot overlay (pattern: home-content-data.test.ts, but
 * across ALL 7 locales): every covered winery × every covered field that the
 * base record populates must have a non-empty catalog string, or the overlay
 * would render a raw key on a booking decision surface.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

describe("winery content overlay (AUD-10 pilot)", () => {
  it("covers only ids that exist in the data", () => {
    for (const id of LOCALIZED_WINERY_IDS) {
      expect(
        wineries.some((w) => w.id === id),
        `LOCALIZED_WINERY_IDS contains unknown winery id ${id}`
      ).toBe(true);
    }
  });

  for (const locale of LOCALES) {
    it(`every covered field has a non-empty ${locale} catalog string`, () => {
      const catalog = loadCatalog(locale);
      const ns = (catalog as { data?: { wineries?: Record<string, Record<string, string>> } })
        .data?.wineries;
      expect(ns, `${locale}: data.wineries namespace missing`).toBeTruthy();
      for (const winery of wineries) {
        if (!LOCALIZED_WINERY_IDS.has(winery.id)) continue;
        for (const field of LOCALIZED_WINERY_FIELDS) {
          if (typeof winery[field] !== "string") continue;
          const value = ns?.[winery.id]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.wineries.${winery.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = (loadCatalog("en") as { data: { wineries: Record<string, Record<string, string>> } })
      .data.wineries;
    for (const winery of wineries) {
      if (!LOCALIZED_WINERY_IDS.has(winery.id)) continue;
      for (const field of LOCALIZED_WINERY_FIELDS) {
        const base = winery[field];
        if (typeof base !== "string") continue;
        expect(ns[winery.id][field], `en drift on ${winery.id}.${field}`).toBe(base);
      }
    }
  });
});
