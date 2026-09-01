import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { trails } from "@/data/trails";
import {
  LOCALIZED_TRAIL_FIELDS,
  LOCALIZED_TRAIL_IDS,
} from "@/lib/trail-content-ids";

/**
 * Guard for the AUD-10 trail overlay (slice 13) — mirrors
 * attraction-content.test.ts: every covered trail × every covered field the
 * base record populates must have a non-empty catalog string in all 7
 * locales, or the overlay would render a raw key on a decision surface.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

describe("trail content overlay (AUD-10 slice 13)", () => {
  it("covers only ids that exist in the trail data", () => {
    for (const id of LOCALIZED_TRAIL_IDS) {
      expect(
        trails.some((t) => t.id === id),
        `LOCALIZED_TRAIL_IDS contains unknown trail id ${id}`
      ).toBe(true);
    }
  });

  for (const locale of LOCALES) {
    it(`every covered field has a non-empty ${locale} catalog string`, () => {
      const catalog = loadCatalog(locale);
      const ns = (
        catalog as { data?: { trails?: Record<string, Record<string, string>> } }
      ).data?.trails;
      expect(ns, `${locale}: data.trails namespace missing`).toBeTruthy();
      for (const trail of trails) {
        if (!LOCALIZED_TRAIL_IDS.has(trail.id)) continue;
        for (const field of LOCALIZED_TRAIL_FIELDS) {
          if (typeof trail[field] !== "string") continue;
          const value = ns?.[trail.id]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.trails.${trail.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = (
      loadCatalog("en") as { data: { trails: Record<string, Record<string, string>> } }
    ).data.trails;
    for (const trail of trails) {
      if (!LOCALIZED_TRAIL_IDS.has(trail.id)) continue;
      for (const field of LOCALIZED_TRAIL_FIELDS) {
        const base = trail[field];
        if (typeof base !== "string") continue;
        expect(ns[trail.id][field], `en drift on ${trail.id}.${field}`).toBe(base);
      }
    }
  });
});
