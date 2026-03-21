import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tripLengthFromDates, daysUntilTrip } from "@/hooks/useTripDates";

describe("tripLengthFromDates", () => {
  it("returns null when start is null", () => {
    expect(tripLengthFromDates(null, "2026-01-10")).toBeNull();
  });

  it("returns null when end is null", () => {
    expect(tripLengthFromDates("2026-01-05", null)).toBeNull();
  });

  it("returns null when both are null", () => {
    expect(tripLengthFromDates(null, null)).toBeNull();
  });

  it("returns null when end is before start", () => {
    expect(tripLengthFromDates("2026-01-10", "2026-01-05")).toBeNull();
  });

  it("returns 1 for same-day trip", () => {
    expect(tripLengthFromDates("2026-01-10", "2026-01-10")).toBe(1);
  });

  it("returns 2 for consecutive days", () => {
    expect(tripLengthFromDates("2026-01-10", "2026-01-11")).toBe(2);
  });

  it("returns 5 for a 5-day trip", () => {
    expect(tripLengthFromDates("2026-01-10", "2026-01-14")).toBe(5);
  });

  it("returns 14 for a 14-day trip (max)", () => {
    expect(tripLengthFromDates("2026-01-01", "2026-01-14")).toBe(14);
  });

  it("caps at 14 days for trips longer than MAX_TRIP_DAYS", () => {
    expect(tripLengthFromDates("2026-01-01", "2026-01-31")).toBe(14);
  });

  it("handles cross-month boundaries", () => {
    expect(tripLengthFromDates("2026-01-30", "2026-02-02")).toBe(4);
  });

  it("handles cross-year boundaries", () => {
    expect(tripLengthFromDates("2025-12-30", "2026-01-02")).toBe(4);
  });

  it("returns 1 as minimum even for sub-day ranges", () => {
    // Same day always returns 1
    expect(tripLengthFromDates("2026-06-15", "2026-06-15")).toBe(1);
  });
});

describe("daysUntilTrip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when start is null", () => {
    expect(daysUntilTrip(null)).toBeNull();
  });

  it("returns 0 when start is today", () => {
    vi.setSystemTime(new Date("2026-03-21T10:00:00"));
    expect(daysUntilTrip("2026-03-21")).toBe(0);
  });

  it("returns 1 when start is tomorrow", () => {
    vi.setSystemTime(new Date("2026-03-21T10:00:00"));
    expect(daysUntilTrip("2026-03-22")).toBe(1);
  });

  it("returns 7 when start is a week away", () => {
    vi.setSystemTime(new Date("2026-03-21T10:00:00"));
    expect(daysUntilTrip("2026-03-28")).toBe(7);
  });

  it("returns negative when start is in the past", () => {
    vi.setSystemTime(new Date("2026-03-21T10:00:00"));
    expect(daysUntilTrip("2026-03-18")).toBe(-3);
  });

  it("returns -1 when start was yesterday", () => {
    vi.setSystemTime(new Date("2026-03-21T10:00:00"));
    expect(daysUntilTrip("2026-03-20")).toBe(-1);
  });

  it("returns large positive for far future dates", () => {
    vi.setSystemTime(new Date("2026-01-01T10:00:00"));
    const result = daysUntilTrip("2026-12-31");
    expect(result).toBe(364);
  });
});
