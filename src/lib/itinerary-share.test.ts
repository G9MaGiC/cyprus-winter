import { describe, it, expect } from "vitest";
import {
  decodeItinerary,
  encodeItinerary,
  buildPlanSharePath,
  MAX_DAYS,
  type ItineraryDays,
} from "./itinerary-share";

function emptyDays(): ItineraryDays {
  return Object.fromEntries(Array.from({ length: MAX_DAYS }, (_, i) => [i + 1, [] as string[]])) as ItineraryDays;
}

describe("decodeItinerary", () => {
  it("returns null for null", () => {
    expect(decodeItinerary(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeItinerary("")).toBeNull();
    expect(decodeItinerary("   ")).toBeNull();
  });

  it("decodes valid format with known place ids", () => {
    const result = decodeItinerary("1:kourion,artemis|2:omodos");
    expect(result).not.toBeNull();
    expect(result).toEqual({ ...emptyDays(), 1: ["kourion", "artemis"], 2: ["omodos"] });
  });

  it("ignores invalid day numbers", () => {
    const result = decodeItinerary("0:artemis|1:kourion|15:omodos");
    expect(result).toEqual({ ...emptyDays(), 1: ["kourion"] });
  });

  it("ignores invalid place ids", () => {
    const result = decodeItinerary("1:unknown-xyz|2:kourion");
    expect(result).toEqual({ ...emptyDays(), 2: ["kourion"] });
  });

  it("returns null when no valid content", () => {
    expect(decodeItinerary("1:unknown|2:invalid")).toBeNull();
  });
});

describe("encodeItinerary", () => {
  it("round-trips with decodeItinerary", () => {
    const days: ItineraryDays = { ...emptyDays(), 1: ["kourion", "artemis"], 2: ["omodos"] };
    const encoded = encodeItinerary(days);
    const decoded = decodeItinerary(encoded);
    expect(decoded).toEqual(days);
  });

  it("skips empty days", () => {
    const days: ItineraryDays = { ...emptyDays(), 1: ["kourion"] };
    expect(encodeItinerary(days)).toBe("1:kourion");
  });
});

describe("buildPlanSharePath", () => {
  it("returns /plan for empty itinerary", () => {
    const days: ItineraryDays = emptyDays();
    expect(buildPlanSharePath(days)).toBe("/plan");
  });

  it("returns /plan?plan=... for non-empty itinerary", () => {
    const days: ItineraryDays = { ...emptyDays(), 1: ["kourion"] };
    const path = buildPlanSharePath(days);
    expect(path).toMatch(/^\/plan\?plan=/);
    expect(path).toContain("1%3Akourion");
  });
});
