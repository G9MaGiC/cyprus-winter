import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { guideBookingSchema, wineryBookingSchema } from "./booking-schemas";

describe("booking calendar-date validation", () => {
  const originalTimeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "America/New_York";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-14T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTimeZone;
  });

  it.each([
    ["winery", wineryBookingSchema],
    ["guide", guideBookingSchema],
  ])("accepts today's %s booking west of UTC", (_type, schema) => {
    const result = schema.safeParse({
      date: "2026-07-14",
      partySize: 2,
      guestName: "Test Guest",
      guestEmail: "test@example.com",
      notes: "",
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ["winery", wineryBookingSchema],
    ["guide", guideBookingSchema],
  ])("rejects impossible calendar dates for %s bookings", (_type, schema) => {
    const result = schema.safeParse({
      date: "2026-02-31",
      partySize: 2,
      guestName: "Test Guest",
      guestEmail: "test@example.com",
      notes: "",
    });

    expect(result.success).toBe(false);
  });
});
