import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTimeBucket,
  getPlaceTimeSignals,
  matchesTimeBucket,
  isAdjacentBucket,
} from "./right-now-buckets";

describe("getTimeBucket", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a valid bucket", () => {
    const bucket = getTimeBucket();
    expect(["morning", "afternoon", "sunset", "night"]).toContain(bucket);
  });

  // We can't easily mock Intl.DateTimeFormat timezone output, but we can test structure
  it("returns one of the four time buckets", () => {
    const result = getTimeBucket();
    expect(typeof result).toBe("string");
  });
});

describe("getPlaceTimeSignals", () => {
  it("returns default signals for beach when no text", () => {
    expect(getPlaceTimeSignals(undefined, "beach")).toEqual(["afternoon", "sunset"]);
  });

  it("returns default signals for winery when no text", () => {
    expect(getPlaceTimeSignals(undefined, "winery")).toEqual(["afternoon"]);
  });

  it("returns default signals for restaurant when no text", () => {
    expect(getPlaceTimeSignals(undefined, "restaurant")).toEqual(["afternoon", "night"]);
  });

  it("returns default signals for trail when no text", () => {
    expect(getPlaceTimeSignals(undefined, "trail")).toEqual(["morning", "afternoon"]);
  });

  it("returns default signals for ancient when no text", () => {
    expect(getPlaceTimeSignals(undefined, "ancient")).toEqual(["morning", "afternoon"]);
  });

  it("returns default signals for village when no text", () => {
    expect(getPlaceTimeSignals(undefined, "village")).toEqual(["morning", "afternoon"]);
  });

  it("returns default signals for monastery when no text", () => {
    expect(getPlaceTimeSignals(undefined, "monastery")).toEqual(["morning", "afternoon"]);
  });

  it("returns default signals for nature when no text", () => {
    expect(getPlaceTimeSignals(undefined, "nature")).toEqual(["morning", "afternoon"]);
  });

  it("returns default signals for event when no text", () => {
    expect(getPlaceTimeSignals(undefined, "event")).toEqual(["afternoon", "night"]);
  });

  it("returns default signals for unknown type when no text", () => {
    expect(getPlaceTimeSignals(undefined, "unknowntype")).toEqual(["morning", "afternoon"]);
  });

  it("detects morning signals from text", () => {
    expect(getPlaceTimeSignals("Open for breakfast from 8am", "restaurant")).toContain("morning");
  });

  it("detects afternoon signals from text", () => {
    expect(getPlaceTimeSignals("Best visited at lunch time", "restaurant")).toContain("afternoon");
    expect(getPlaceTimeSignals("Open midday to 5pm", "winery")).toContain("afternoon");
  });

  it("detects sunset signals from text", () => {
    expect(getPlaceTimeSignals("Golden hour views are spectacular", "beach")).toContain("sunset");
    expect(getPlaceTimeSignals("Best at dusk", "nature")).toContain("sunset");
  });

  it("detects night signals from text", () => {
    expect(getPlaceTimeSignals("Live music at 9pm every Friday", "restaurant")).toContain("night");
    expect(getPlaceTimeSignals("Dinner service from 7pm", "restaurant")).toContain("night");
  });

  it("detects multiple signals from rich text", () => {
    const signals = getPlaceTimeSignals("Breakfast from 8am, lunch at noon, dinner at 8pm", "restaurant");
    expect(signals).toContain("morning");
    expect(signals).toContain("afternoon");
    expect(signals).toContain("night");
  });

  it("returns defaults when text has no time keywords", () => {
    const signals = getPlaceTimeSignals("A wonderful place with great views", "beach");
    expect(signals).toEqual(["afternoon", "sunset"]);
  });

  it("deduplicates signals", () => {
    // "early morning" matches both morning (via "morning") and night (via "early morning")
    const signals = getPlaceTimeSignals("Early morning walks recommended", "trail");
    const unique = [...new Set(signals)];
    expect(signals.length).toBe(unique.length);
  });
});

describe("matchesTimeBucket", () => {
  it("returns true when current bucket is in preferred list", () => {
    expect(matchesTimeBucket(["morning", "afternoon"], "morning")).toBe(true);
    expect(matchesTimeBucket(["morning", "afternoon"], "afternoon")).toBe(true);
  });

  it("returns false when current bucket is not in preferred list", () => {
    expect(matchesTimeBucket(["morning", "afternoon"], "night")).toBe(false);
    expect(matchesTimeBucket(["sunset"], "morning")).toBe(false);
  });

  it("returns false for empty preferred list", () => {
    expect(matchesTimeBucket([], "morning")).toBe(false);
  });
});

describe("isAdjacentBucket", () => {
  it("morning is adjacent to afternoon (current=afternoon)", () => {
    expect(isAdjacentBucket("morning", "afternoon")).toBe(true);
  });

  it("afternoon is adjacent to morning (current=morning)", () => {
    expect(isAdjacentBucket("afternoon", "morning")).toBe(true);
  });

  it("sunset is adjacent to afternoon (current=afternoon)", () => {
    expect(isAdjacentBucket("sunset", "afternoon")).toBe(true);
  });

  it("night is adjacent to sunset (current=sunset)", () => {
    expect(isAdjacentBucket("night", "sunset")).toBe(true);
  });

  it("night wraps around to morning (current=morning)", () => {
    expect(isAdjacentBucket("night", "morning")).toBe(true);
  });

  it("morning wraps around to night (current=night)", () => {
    expect(isAdjacentBucket("morning", "night")).toBe(true);
  });

  it("non-adjacent buckets return false", () => {
    expect(isAdjacentBucket("morning", "sunset")).toBe(false);
    expect(isAdjacentBucket("afternoon", "night")).toBe(false);
  });
});
