import { describe, it, expect } from "vitest";
import { getRelatedPlaces, getCombineWith, getSimilarDiscoverPlaces } from "./related-places";
import { allAttractions } from "@/data";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";

describe("getRelatedPlaces", () => {
  it("returns empty array for empty ids", () => {
    expect(getRelatedPlaces([])).toEqual([]);
  });

  it("returns places for known attraction ids", () => {
    const result = getRelatedPlaces(["omodos"]);
    expect(result.length).toBe(1);
    expect(result[0].name).toContain("Omodos");
    expect(result[0].href).toBe("/discover/omodos");
  });

  it("returns trails for known trail ids", () => {
    const result = getRelatedPlaces(["artemis"]);
    expect(result.length).toBe(1);
    expect(result[0].name).toContain("Artemis");
    expect(result[0].href).toBe("/trails/artemis");
    expect(result[0].type).toBe("trail");
  });

  it("returns restaurant for known restaurant id", () => {
    const result = getRelatedPlaces(["zygi-tavernas"]);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("restaurant");
  });

  it("skips unknown ids", () => {
    const result = getRelatedPlaces(["unknown-id-xyz"]);
    expect(result).toEqual([]);
  });
});

describe("combineWith validation", () => {
  it("all combineWith IDs resolve to valid places", () => {
    const allIds = new Set<string>();
    for (const a of allAttractions) {
      if (a.combineWith) for (const id of a.combineWith) allIds.add(id);
    }
    for (const t of trails) {
      if (t.combineWith) for (const id of t.combineWith) allIds.add(id);
    }
    for (const w of wineries) {
      if (w.combineWith) for (const id of w.combineWith) allIds.add(id);
    }
    for (const r of restaurants) {
      if (r.combineWith) for (const id of r.combineWith) allIds.add(id);
    }
    for (const id of allIds) {
      const places = getRelatedPlaces([id]);
      expect(places, `combineWith id "${id}" should resolve to a place`).toHaveLength(1);
    }
  });
});

describe("getCombineWith", () => {
  it("returns empty array for place without combineWith", () => {
    const ids = getCombineWith("unknown-xyz");
    expect(ids).toEqual([]);
  });

  it("returns multiple places for multiple ids", () => {
    const result = getRelatedPlaces(["omodos", "artemis", "unknown"]);
    expect(result.length).toBe(2);
  });

  it("returns combineWith IDs for place that has them", () => {
    const ids = getCombineWith("artemis");
    expect(Array.isArray(ids)).toBe(true);
  });
});

describe("getSimilarDiscoverPlaces", () => {
  it("returns empty for non-existent region", () => {
    const result = getSimilarDiscoverPlaces("omodos", "village", "NowhereLand");
    expect(result).toEqual([]);
  });

  it("returns similar places without duplicates and excludes current", () => {
    const result = getSimilarDiscoverPlaces("domes-sergiou", "winery", "Skarinou (Larnaca)", 6);
    const ids = result.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("domes-sergiou");
  });
});

