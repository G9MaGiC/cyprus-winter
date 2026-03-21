import { describe, it, expect } from "vitest";
import { TRACK_EVENTS, PRODUCT_EVENTS } from "./track-events";

describe("TRACK_EVENTS", () => {
  it("is a non-empty readonly array", () => {
    expect(Array.isArray(TRACK_EVENTS)).toBe(true);
    expect(TRACK_EVENTS.length).toBeGreaterThan(0);
  });

  it("contains expected funnel events", () => {
    const funnelEvents = [
      "page_view",
      "discover_view",
      "winery_detail_view",
      "booking_start",
      "booking_complete",
    ];
    for (const e of funnelEvents) {
      expect(TRACK_EVENTS).toContain(e);
    }
  });

  it("contains plan-related events", () => {
    expect(TRACK_EVENTS).toContain("plan_add");
    expect(TRACK_EVENTS).toContain("plan_view");
    expect(TRACK_EVENTS).toContain("plan_remove");
    expect(TRACK_EVENTS).toContain("plan_share");
  });

  it("contains onboarding events", () => {
    expect(TRACK_EVENTS).toContain("onboarding_started");
    expect(TRACK_EVENTS).toContain("onboarding_dismissed");
    expect(TRACK_EVENTS).toContain("onboarding_intent_planning");
    expect(TRACK_EVENTS).toContain("onboarding_intent_exploring");
    expect(TRACK_EVENTS).toContain("onboarding_intent_browsing");
  });

  it("has no duplicate entries", () => {
    const unique = new Set(TRACK_EVENTS);
    expect(unique.size).toBe(TRACK_EVENTS.length);
  });

  it("all entries are non-empty strings", () => {
    for (const e of TRACK_EVENTS) {
      expect(typeof e).toBe("string");
      expect(e.length).toBeGreaterThan(0);
    }
  });
});

describe("PRODUCT_EVENTS", () => {
  it("is a non-empty readonly array", () => {
    expect(Array.isArray(PRODUCT_EVENTS)).toBe(true);
    expect(PRODUCT_EVENTS.length).toBeGreaterThan(0);
  });

  it("is a strict subset of TRACK_EVENTS", () => {
    for (const pe of PRODUCT_EVENTS) {
      expect(TRACK_EVENTS).toContain(pe);
    }
  });

  it("contains only plan-related events", () => {
    for (const pe of PRODUCT_EVENTS) {
      expect(pe).toMatch(/^plan_/);
    }
  });

  it("has no duplicate entries", () => {
    const unique = new Set(PRODUCT_EVENTS);
    expect(unique.size).toBe(PRODUCT_EVENTS.length);
  });

  it("includes plan_add and plan_remove", () => {
    expect(PRODUCT_EVENTS).toContain("plan_add");
    expect(PRODUCT_EVENTS).toContain("plan_remove");
  });
});
