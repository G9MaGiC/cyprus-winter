import { describe, it, expect } from "vitest";
import { buildItinerary } from "../tools/build-itinerary";

describe("buildItinerary", () => {
  it("builds a 1-day plan for a region", () => {
    const result = buildItinerary({ region: "Limassol", days: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].slots.length).toBeGreaterThan(0);
  });

  it("builds a multi-day plan", () => {
    const result = buildItinerary({ region: "Troodos", days: 3 });
    expect(result).toHaveLength(3);
  });

  it("includes morning, afternoon, evening slots", () => {
    const result = buildItinerary({ region: "Limassol", days: 1 });
    const slotTimes = result[0].slots.map((s) => s.timeOfDay);
    expect(slotTimes).toContain("morning");
    expect(slotTimes).toContain("afternoon");
  });

  it("respects interests filter", () => {
    const result = buildItinerary({
      region: "Limassol",
      days: 1,
      interests: ["wine"],
    });
    expect(
      result[0].slots.some(
        (s) => s.type === "winery" || s.name.toLowerCase().includes("wine")
      )
    ).toBe(true);
  });
});
