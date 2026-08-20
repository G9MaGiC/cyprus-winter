import { describe, expect, it } from "vitest";
import { decodeItinerary, MAX_DAYS, type ItineraryDays } from "@/lib/itinerary-share";
import {
  buildPlanShareCopy,
  buildPlanSharePreview,
  formatPlanSharePlacesLine,
} from "@/lib/plan-share-preview";

function emptyDays(): ItineraryDays {
  return Object.fromEntries(Array.from({ length: MAX_DAYS }, (_, i) => [i + 1, [] as string[]])) as ItineraryDays;
}

describe("buildPlanSharePreview", () => {
  it("returns null for empty itinerary", () => {
    expect(buildPlanSharePreview(emptyDays())).toBeNull();
    expect(buildPlanSharePreview(null)).toBeNull();
  });

  it("summarizes a one-place day", () => {
    const preview = buildPlanSharePreview({ ...emptyDays(), 1: ["kourion"] });
    expect(preview).toEqual({
      named: ["Kourion"],
      extraCount: 0,
      placeCount: 1,
      dayCount: 1,
      firstPlaceId: "kourion",
      firstPlaceType: "attraction",
    });
  });

  it("keeps first two names and a remainder for longer plans", () => {
    const days = decodeItinerary("1:kourion,omodos|2:artemis,lefkara");
    const preview = buildPlanSharePreview(days);
    expect(preview?.named).toEqual(["Kourion", "Omodos"]);
    expect(preview?.extraCount).toBe(2);
    expect(preview?.placeCount).toBe(4);
    expect(preview?.dayCount).toBe(2);
    expect(preview?.firstPlaceId).toBe("kourion");
  });

  it("skips unknown ids", () => {
    const preview = buildPlanSharePreview({ ...emptyDays(), 1: ["not-a-place", "kourion"] });
    expect(preview?.named).toEqual(["Kourion"]);
    expect(preview?.placeCount).toBe(1);
  });
});

describe("formatPlanSharePlacesLine", () => {
  const labels = {
    two: (a: string, b: string) => `${a} and ${b}`,
    three: (a: string, b: string, c: string) => `${a}, ${b} and ${c}`,
    more: (a: string, b: string, count: number) => `${a}, ${b} and ${count} more`,
  };

  it("joins one, two, three, and remainder lists", () => {
    expect(formatPlanSharePlacesLine(["Kourion"], 0, labels)).toBe("Kourion");
    expect(formatPlanSharePlacesLine(["Kourion", "Omodos"], 0, labels)).toBe("Kourion and Omodos");
    expect(formatPlanSharePlacesLine(["Kourion", "Omodos", "Lefkara"], 0, labels)).toBe(
      "Kourion, Omodos and Lefkara"
    );
    expect(formatPlanSharePlacesLine(["Kourion", "Omodos"], 2, labels)).toBe("Kourion, Omodos and 2 more");
  });
});

describe("buildPlanShareCopy", () => {
  const labels = {
    two: (a: string, b: string) => `${a} and ${b}`,
    three: (a: string, b: string, c: string) => `${a}, ${b} and ${c}`,
    more: (a: string, b: string, count: number) => `${a}, ${b} and ${count} more`,
    title: (places: string) => `${places} — Cyprus Winter`,
    description: (places: string, placeCount: number, dayCount: number) =>
      `${places}. ${placeCount} places across ${dayCount} days. Open in Plan to save and tweak.`,
  };

  it("builds a story-grade title and one-line summary", () => {
    const preview = buildPlanSharePreview({ ...emptyDays(), 1: ["kourion"], 2: ["omodos"] });
    const copy = buildPlanShareCopy(preview, labels);
    expect(copy).not.toBeNull();
    expect(copy?.title).toBe("Kourion and Omodos — Cyprus Winter");
    expect(copy?.description).toContain("Kourion and Omodos");
    expect(copy?.description).toContain("2 places");
    expect(copy?.description).toContain("2 days");
    expect(copy?.placesLine).toBe("Kourion and Omodos");
  });
});
