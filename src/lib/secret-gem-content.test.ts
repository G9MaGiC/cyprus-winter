import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { secretGems } from "@/data/secret-gems";
import {
  LOCALIZED_SECRET_GEM_FIELDS,
  LOCALIZED_SECRET_GEM_IDS,
} from "@/lib/secret-gem-content-ids";

/**
 * Guard for the AUD-10 secret-gem overlay — mirrors trail-content.test.ts:
 * every covered gem × every covered field must have a non-empty catalog
 * string in all 7 locales, or the overlay would render a raw key on the
 * /secrets hub and the discover/trail detail pages.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

describe("secret-gem content overlay (AUD-10 final class)", () => {
  it("covers only ids that exist in the secret-gem data", () => {
    for (const id of LOCALIZED_SECRET_GEM_IDS) {
      expect(
        secretGems.some((g) => g.id === id),
        `LOCALIZED_SECRET_GEM_IDS contains unknown gem id ${id}`
      ).toBe(true);
    }
  });

  for (const locale of LOCALES) {
    it(`every covered field has a non-empty ${locale} catalog string`, () => {
      const catalog = loadCatalog(locale);
      const ns = (
        catalog as { data?: { secretGems?: Record<string, Record<string, string>> } }
      ).data?.secretGems;
      expect(ns, `${locale}: data.secretGems namespace missing`).toBeTruthy();
      for (const gem of secretGems) {
        if (!LOCALIZED_SECRET_GEM_IDS.has(gem.id)) continue;
        for (const field of LOCALIZED_SECRET_GEM_FIELDS) {
          const value = ns?.[gem.id]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.secretGems.${gem.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim (single source of truth stays in data)", () => {
    const ns = (
      loadCatalog("en") as { data: { secretGems: Record<string, Record<string, string>> } }
    ).data.secretGems;
    for (const gem of secretGems) {
      if (!LOCALIZED_SECRET_GEM_IDS.has(gem.id)) continue;
      for (const field of LOCALIZED_SECRET_GEM_FIELDS) {
        expect(ns[gem.id]?.[field], `en: data.secretGems.${gem.id}.${field}`).toBe(gem[field]);
      }
    }
  });
});
