import { describe, it, expect } from "vitest";
import { BEST_FOR_OPTIONS } from "./best-for";

describe("BEST_FOR_OPTIONS", () => {
  it("is an array", () => {
    expect(Array.isArray(BEST_FOR_OPTIONS)).toBe(true);
  });

  it("is empty by default (placeholder for future filter chips)", () => {
    expect(BEST_FOR_OPTIONS).toEqual([]);
  });

  it("each item would have slug and label if populated", () => {
    // Structural test — validates the type shape if items are added
    for (const option of BEST_FOR_OPTIONS) {
      expect(option).toHaveProperty("slug");
      expect(option).toHaveProperty("label");
      expect(typeof option.slug).toBe("string");
      expect(typeof option.label).toBe("string");
    }
  });
});
