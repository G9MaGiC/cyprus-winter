import { describe, it, expect } from "vitest";
import {
  decodeItinerary,
  encodeItinerary,
  buildPlanSharePath,
  type ItineraryDays,
} from "./itinerary-share";

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
    expect(result).toEqual({
      1: ["kourion", "artemis"],
      2: ["omodos"],
      3: [],
      4: [],
      5: [],
    });
  });

  it("ignores invalid day numbers", () => {
    const result = decodeItinerary("0:artemis|1:kourion|6:omodos");
    expect(result).toEqual({
      1: ["kourion"],
      2: [],
      3: [],
      4: [],
      5: [],
    });
  });

  it("ignores invalid place ids", () => {
    const result = decodeItinerary("1:unknown-xyz|2:kourion");
    expect(result).toEqual({
      1: [],
      2: ["kourion"],
      3: [],
      4: [],
      5: [],
    });
  });

  it("returns null when no valid content", () => {
    expect(decodeItinerary("1:unknown|2:invalid")).toBeNull();
  });
});

describe("encodeItinerary", () => {
  it("round-trips with decodeItinerary", () => {
    const days: ItineraryDays = {
      1: ["kourion", "artemis"],
      2: ["omodos"],
      3: [],
      4: [],
      5: [],
    };
    const encoded = encodeItinerary(days);
    const decoded = decodeItinerary(encoded);
    expect(decoded).toEqual(days);
  });

  it("skips empty days", () => {
    const days: ItineraryDays = { 1: ["kourion"], 2: [], 3: [], 4: [], 5: [] };
    expect(encodeItinerary(days)).toBe("1:kourion");
  });
});

describe("buildPlanSharePath", () => {
  it("returns /plan for empty itinerary", () => {
    const days: ItineraryDays = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    expect(buildPlanSharePath(days)).toBe("/plan");
  });

  it("returns /plan?plan=... for non-empty itinerary", () => {
    const days: ItineraryDays = { 1: ["kourion"], 2: [], 3: [], 4: [], 5: [] };
    const path = buildPlanSharePath(days);
    expect(path).toMatch(/^\/plan\?plan=/);
    expect(path).toContain("1%3Akourion");
  });
});
