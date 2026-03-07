import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDate, daysUntil, getUpcomingDateGroup, formatReportedAgo } from "./format";

describe("formatReportedAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for dates within the last hour', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-05T11:30:00Z")).toBe("Just now");
  });

  it('returns "Xh ago" for dates within the last 24 hours', () => {
    vi.setSystemTime(new Date("2026-03-05T14:00:00Z"));
    expect(formatReportedAgo("2026-03-05T12:00:00Z")).toBe("2h ago");
  });

  it('returns "Yesterday" for 1 day ago', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-04T12:00:00Z")).toBe("Yesterday");
  });

  it('returns "Xd ago" for dates within the last week', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-03T12:00:00Z")).toBe("2d ago");
  });

  it("returns Invalid Date string for invalid input", () => {
    expect(formatReportedAgo("not-a-date")).toBe("Invalid Date");
  });

  it("returns locale date string for older dates", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const result = formatReportedAgo("2026-02-20T12:00:00Z");
    expect(result).toMatch(/\d/);
  });
});

describe("formatDate", () => {
  it("handles invalid date string", () => {
    const result = formatDate("not-a-date");
    expect(result).toContain("Invalid");
  });

  it("formats ISO date string", () => {
    const result = formatDate("2026-03-15");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Mar/);
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    const today = new Date();
    const str = today.toISOString().slice(0, 10);
    expect(daysUntil(str)).toBe(0);
  });

  it("returns negative for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    expect(daysUntil(past.toISOString().slice(0, 10))).toBe(-2);
  });

  it("returns positive for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(daysUntil(future.toISOString().slice(0, 10))).toBe(3);
  });
});

describe("getUpcomingDateGroup", () => {
  it('returns "today" for today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(getUpcomingDateGroup(today)).toBe("today");
  });

  it('returns "this_week" for within 7 days', () => {
    const in3 = new Date();
    in3.setDate(in3.getDate() + 3);
    expect(getUpcomingDateGroup(in3.toISOString().slice(0, 10))).toBe("this_week");
  });

  it('returns "this_week" for exactly 7 days from now', () => {
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    expect(getUpcomingDateGroup(in7.toISOString().slice(0, 10))).toBe("this_week");
  });

  it('returns "later" for beyond 7 days', () => {
    const in10 = new Date();
    in10.setDate(in10.getDate() + 10);
    expect(getUpcomingDateGroup(in10.toISOString().slice(0, 10))).toBe("later");
  });
});

