import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDate, daysUntil, getUpcomingDateGroup, formatReportedAgo } from "./format";

describe("formatReportedAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns locale-relative time for dates within the last hour", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const expected = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }).format(
      0,
      "minute"
    );
    expect(formatReportedAgo("2026-03-05T11:30:00Z", "en")).toBe(expected);
  });

  it("returns locale-relative time for dates within the last 24 hours", () => {
    vi.setSystemTime(new Date("2026-03-05T14:00:00Z"));
    const expected = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }).format(
      -2,
      "hour"
    );
    expect(formatReportedAgo("2026-03-05T12:00:00Z", "en")).toBe(expected);
  });

  it("returns locale-relative time for 1 day ago", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const expected = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }).format(
      -1,
      "day"
    );
    expect(formatReportedAgo("2026-03-04T12:00:00Z", "en")).toBe(expected);
  });

  it("returns locale-relative time for dates within the last week", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const expected = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" }).format(
      -2,
      "day"
    );
    expect(formatReportedAgo("2026-03-03T12:00:00Z", "en")).toBe(expected);
  });

  it("returns Invalid Date string for invalid input", () => {
    expect(formatReportedAgo("not-a-date", "en")).toBe("Invalid Date");
  });

  it("returns locale date string for older dates", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const result = formatReportedAgo("2026-02-20T12:00:00Z", "en");
    expect(result).toMatch(/\d/);
  });
});

describe("formatDate", () => {
  it("handles invalid date string", () => {
    expect(formatDate("not-a-date", "en")).toBe("Invalid Date");
  });

  it("formats ISO date string", () => {
    const result = formatDate("2026-03-15", "en");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Mar/);
  });
});

/** YYYY-MM-DD in local time (daysUntil uses local midnight). */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    const today = new Date();
    expect(daysUntil(toLocalDateStr(today))).toBe(0);
  });

  it("returns negative for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 2);
    expect(daysUntil(toLocalDateStr(past))).toBe(-2);
  });

  it("returns positive for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(daysUntil(toLocalDateStr(future))).toBe(3);
  });
});

describe("getUpcomingDateGroup", () => {
  it('returns "today" for today', () => {
    expect(getUpcomingDateGroup(toLocalDateStr(new Date()))).toBe("today");
  });

  it('returns "this_week" for within 7 days', () => {
    const in3 = new Date();
    in3.setDate(in3.getDate() + 3);
    expect(getUpcomingDateGroup(toLocalDateStr(in3))).toBe("this_week");
  });

  it('returns "this_week" for exactly 7 days from now', () => {
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    expect(getUpcomingDateGroup(toLocalDateStr(in7))).toBe("this_week");
  });

  it('returns "later" for beyond 7 days', () => {
    const in10 = new Date();
    in10.setDate(in10.getDate() + 10);
    expect(getUpcomingDateGroup(toLocalDateStr(in10))).toBe("later");
  });
});

