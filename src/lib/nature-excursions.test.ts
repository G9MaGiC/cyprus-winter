import { describe, expect, it } from "vitest";
import { natureExcursions } from "@/data/nature-excursions";
import {
  NATURE_EXCURSION_REGIONS,
  filterNatureExcursions,
  natureExcursionCount,
  winterPickExcursions,
} from "@/lib/nature-excursions";

describe("nature-excursions", () => {
  it("loads curated VC sites of interest", () => {
    expect(natureExcursionCount()).toBeGreaterThanOrEqual(10);
  });

  it("has unique ids and valid VC URLs", () => {
    const ids = new Set<string>();
    for (const site of natureExcursions) {
      expect(ids.has(site.id)).toBe(false);
      ids.add(site.id);
      expect(site.visitCyprusUrl).toMatch(/^https:\/\/www\.visitcyprus\.com\//);
      expect(NATURE_EXCURSION_REGIONS).toContain(site.region);
    }
  });

  it("filters by region", () => {
    const troodos = filterNatureExcursions({ region: "troodos" });
    expect(troodos.length).toBeGreaterThan(0);
    expect(troodos.every((e) => e.region === "troodos")).toBe(true);
  });

  it("flags winter picks for hub highlights", () => {
    expect(winterPickExcursions().length).toBeGreaterThanOrEqual(5);
  });
});
