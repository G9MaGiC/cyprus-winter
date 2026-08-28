import { describe, expect, it } from "vitest";
import { getPlanDayIndex, getPlanDayMapFocus } from "@/lib/discover-map-focus";

describe("getPlanDayIndex", () => {
  it("returns active day when trip has not started", () => {
    expect(getPlanDayIndex({ start: "2099-01-01", end: "2099-01-07" }, 3)).toBe(3);
  });

  it("returns calendar day when trip is active", () => {
    const start = new Date();
    start.setDate(start.getDate() - 2);
    const iso = start.toISOString().slice(0, 10);
    expect(getPlanDayIndex({ start: iso, end: iso }, 1)).toBe(3);
  });
});

describe("getPlanDayMapFocus", () => {
  it("is disabled without trip start", () => {
    const focus = getPlanDayMapFocus({ 1: ["omodos"] }, 1, { start: null, end: null });
    expect(focus.enabled).toBe(false);
  });

  it("is enabled with trip start and plan places with coords", () => {
    const focus = getPlanDayMapFocus(
      { 1: ["omodos", "tsiakkas"] },
      1,
      { start: "2099-06-01", end: "2099-06-07" }
    );
    expect(focus.enabled).toBe(true);
    expect(focus.placeIds.length).toBeGreaterThan(0);
    expect(focus.center).not.toBeNull();
    expect(focus.bounds).not.toBeNull();
  });

  it("is disabled when plan day is empty", () => {
    const focus = getPlanDayMapFocus(
      { 1: [] },
      1,
      { start: "2099-06-01", end: "2099-06-07" }
    );
    expect(focus.enabled).toBe(false);
  });
});
