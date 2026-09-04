import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { beaches, natureSites, ancientSites, villages, monasteries } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { activityPlaces } from "@/data/activity-places";
import { ITINERARY_TEMPLATES } from "@/data/itinerary-templates";
import { formatBestForSentence, slugifyBestFor } from "@/lib/best-for-shared";

/**
 * Guard for the AUD-99 bestFor display overlay: every bestFor token shipped
 * anywhere in the data layer must have a non-empty `data.bestFor.{slug}`
 * catalog string in all 7 locales (new data tokens fail here until their
 * translations land), slugs must not collide, the EN catalog must mirror the
 * data verbatim, and the catalog must not accumulate orphan keys.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadBestForNamespace(locale: string): Record<string, string> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  const catalog = JSON.parse(fs.readFileSync(p, "utf8")) as {
    data?: { bestFor?: Record<string, string> };
  };
  return catalog.data?.bestFor ?? {};
}

function collectTokens(): Map<string, string> {
  const all: { bestFor?: string[] }[] = [
    ...beaches,
    ...natureSites,
    ...ancientSites,
    ...villages,
    ...monasteries,
    ...wineries,
    ...restaurants,
    ...activityPlaces,
    ...ITINERARY_TEMPLATES,
  ];
  const bySlug = new Map<string, string>();
  for (const item of all) {
    for (const token of item.bestFor ?? []) {
      const slug = slugifyBestFor(token);
      const prev = bySlug.get(slug);
      expect(
        prev === undefined || prev === token,
        `slug collision: "${slug}" maps to both "${prev}" and "${token}"`
      ).toBe(true);
      bySlug.set(slug, token);
    }
  }
  return bySlug;
}

describe("bestFor display overlay (AUD-99)", () => {
  const tokens = collectTokens();

  it("collects a plausible vocabulary from the data layer", () => {
    expect(tokens.size).toBeGreaterThanOrEqual(300);
  });

  for (const locale of LOCALES) {
    it(`every bestFor token has a non-empty ${locale} catalog string`, () => {
      const ns = loadBestForNamespace(locale);
      for (const [slug, token] of tokens) {
        const value = ns[slug];
        expect(
          typeof value === "string" && value.trim().length > 0,
          `${locale}: data.bestFor.${slug} ("${token}") missing or empty`
        ).toBe(true);
      }
    });
  }

  it("the EN catalog mirrors the data tokens verbatim (single source of truth stays in data)", () => {
    const ns = loadBestForNamespace("en");
    for (const [slug, token] of tokens) {
      expect(ns[slug], `en drift on data.bestFor.${slug}`).toBe(token);
    }
  });

  it("the catalog carries no orphan keys beyond the data vocabulary", () => {
    const ns = loadBestForNamespace("en");
    for (const slug of Object.keys(ns)) {
      expect(tokens.has(slug), `orphan catalog key data.bestFor.${slug}`).toBe(true);
    }
  });

  it("formatBestForSentence keeps the legacy EN output and locale-correct joiners", () => {
    expect(formatBestForSentence(["Couples", "Photography"], "en")).toBe("couples and photography");
    expect(formatBestForSentence(["Paare", "Fotografie"], "de")).toBe("Paare und Fotografie");
    expect(formatBestForSentence(["ζευγάρια", "φωτογραφία"], "el")).toBe("ζευγάρια και φωτογραφία");
    // Hebrew fuses the conjunction onto a Hebrew last word — no "ו-" hyphen form.
    expect(formatBestForSentence(["זוגות", "צילום"], "he")).toBe("זוגות וצילום");
    // …but a Latin label takes the hyphenated "ו-" form plus LTR isolates
    // (the live case: winery sygkrasi keeps "The Farmyard" untranslated).
    expect(formatBestForSentence(["יום באקמס", "The Farmyard"], "he")).toBe(
      "יום באקמס ו-⁦The Farmyard⁩"
    );
    // A Latin-initial FIRST label gets a maqaf so the frame's fused "ל{types}"
    // reads "ל־" before it.
    expect(formatBestForSentence(["The Farmyard", "קרבה לחוף"], "he")).toBe(
      "־⁦The Farmyard⁩ וקרבה לחוף"
    );
    expect(formatBestForSentence(["Solo"], "fr")).toBe("Solo");
  });
});
