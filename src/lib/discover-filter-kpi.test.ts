import { describe, expect, it } from "vitest";
import { countDiscoverFilters, discoverFilterFromProperties } from "./discover-filter-kpi";

describe("discoverFilterFromProperties", () => {
  it("keeps practical G3 filters", () => {
    expect(discoverFilterFromProperties({ filter: "accessible" })).toBe("accessible");
    expect(discoverFilterFromProperties({ filter: "Family" })).toBe("family");
    expect(discoverFilterFromProperties({ filter: "cycling" })).toBe("cycling");
  });

  it("maps unknown or missing filters honestly", () => {
    expect(discoverFilterFromProperties({})).toBe("unknown");
    expect(discoverFilterFromProperties({ filter: "golf-weddings" })).toBe("other");
  });
});

describe("countDiscoverFilters", () => {
  it("counts allowlisted filters", () => {
    const rows = countDiscoverFilters(["accessible", "cycling", "accessible", undefined]);
    expect(rows).toEqual([
      { filter: "accessible", count: 2 },
      { filter: "cycling", count: 1 },
      { filter: "unknown", count: 1 },
    ]);
  });
});
