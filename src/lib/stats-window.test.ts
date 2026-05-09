import { describe, expect, it } from "vitest";
import {
  getPreviousStatsRange,
  getStatsRangeStartUtc,
  getStatsWindowLabel,
  parseStatsWindow,
} from "./stats-window";

describe("parseStatsWindow", () => {
  it("defaults invalid values to mtd", () => {
    expect(parseStatsWindow(null)).toBe("mtd");
    expect(parseStatsWindow("")).toBe("mtd");
    expect(parseStatsWindow("foo")).toBe("mtd");
  });

  it("accepts 7d and 30d", () => {
    expect(parseStatsWindow("7d")).toBe("7d");
    expect(parseStatsWindow("30d")).toBe("30d");
  });
});

describe("getStatsRangeStartUtc", () => {
  it("mtd is first day of month UTC", () => {
    const now = new Date("2026-05-15T14:30:00.000Z");
    const start = getStatsRangeStartUtc("mtd", now);
    expect(start.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("7d is seven calendar days before UTC day start", () => {
    const now = new Date("2026-05-15T14:30:00.000Z");
    const start = getStatsRangeStartUtc("7d", now);
    expect(start.toISOString()).toBe("2026-05-08T00:00:00.000Z");
  });

  it("30d is thirty calendar days before UTC day start", () => {
    const now = new Date("2026-05-15T14:30:00.000Z");
    const start = getStatsRangeStartUtc("30d", now);
    expect(start.toISOString()).toBe("2026-04-15T00:00:00.000Z");
  });
});

describe("getPreviousStatsRange", () => {
  it("mirrors duration before current start", () => {
    const currentStart = new Date("2026-05-01T00:00:00.000Z");
    const currentEnd = new Date("2026-05-15T12:00:00.000Z");
    const prev = getPreviousStatsRange(currentStart, currentEnd);
    expect(prev.end.toISOString()).toBe(currentStart.toISOString());
    const duration = currentEnd.getTime() - currentStart.getTime();
    expect(prev.start.getTime()).toBe(currentStart.getTime() - duration);
  });
});

describe("getStatsWindowLabel", () => {
  it("returns labels", () => {
    expect(getStatsWindowLabel("mtd")).toContain("month");
    expect(getStatsWindowLabel("7d")).toContain("7");
    expect(getStatsWindowLabel("30d")).toContain("30");
  });
});
