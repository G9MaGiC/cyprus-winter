// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { wineryBookingSchema } from "@/lib/booking-schemas";
import { useBookingForm } from "./useBookingForm";

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

describe("useBookingForm", () => {
  const originalTimeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "America/New_York";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTimeZone;
  });

  it("uses the local calendar date for the minimum booking date", () => {
    vi.setSystemTime(new Date("2026-07-15T01:30:00.000Z"));

    const { result } = renderHook(() =>
      useBookingForm(
        {
          type: "winery_tasting",
          providerId: "tsiakkas",
          providerName: "Tsiakkas Winery",
          schema: wineryBookingSchema,
        },
        {
          failed: "Failed",
          fallback: "Try again",
          offlineQueued: "Queued",
        }
      )
    );

    expect(result.current.todayStr).toBe("2026-07-14");
  });
});
