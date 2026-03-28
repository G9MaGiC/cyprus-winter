import { describe, it, expect } from "vitest";
import { searchPlaces } from "../tools/search-places";

describe("searchPlaces", () => {
  it("returns places matching a query", () => {
    const results = searchPlaces({ query: "Omodos" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.id === "omodos")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchPlaces({ query: "", region: "Paphos" });
    expect(results.every((p) => p.region.includes("Paphos"))).toBe(true);
  });

  it("filters by category", () => {
    const results = searchPlaces({ query: "", categories: ["beach"] });
    expect(results.every((p) => p.type === "beach")).toBe(true);
  });

  it("respects limit", () => {
    const results = searchPlaces({ query: "", limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("ranks by season in winter", () => {
    const results = searchPlaces({ query: "village", season: "winter", limit: 5 });
    expect(results.length).toBeGreaterThan(0);
  });
});
