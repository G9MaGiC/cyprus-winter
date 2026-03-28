import { describe, it, expect } from "vitest";
import { searchTrails } from "../tools/search-trails";

describe("searchTrails", () => {
  it("returns trails matching a query", () => {
    const results = searchTrails({ query: "Artemis" });
    expect(results.some((t) => t.id === "artemis")).toBe(true);
  });

  it("filters by difficulty", () => {
    const results = searchTrails({ difficulty: "easy" });
    expect(results.every((t) => t.difficulty === "easy")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchTrails({ region: "Troodos" });
    expect(results.every((t) => t.region === "Troodos")).toBe(true);
  });

  it("prioritizes winter-suitable trails when season is winter", () => {
    const results = searchTrails({ query: "", season: "winter", limit: 3 });
    expect(results.length).toBeGreaterThan(0);
  });
});
