// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { wineryBookingSchema } from "@/lib/booking-schemas";
import { useBookingForm } from "./useBookingForm";

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

function useTestBookingForm() {
  return useBookingForm(
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
  );
}

function BookingDateInput() {
  const { todayStr } = useTestBookingForm();
  return <input type="date" min={todayStr} />;
}

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

    const { result } = renderHook(useTestBookingForm);
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(result.current.todayStr).toBe("2026-07-14");
  });

  it("hydrates the minimum date from the browser timezone", async () => {
    vi.setSystemTime(new Date("2026-07-15T01:30:00.000Z"));
    process.env.TZ = "UTC";
    const serverHtml = renderToString(<BookingDateInput />);

    expect(serverHtml).toContain('min=""');

    process.env.TZ = "America/New_York";
    const container = document.createElement("div");
    container.innerHTML = serverHtml;

    const root = hydrateRoot(container, <BookingDateInput />);
    await act(async () => {});

    expect(container.querySelector("input")?.min).toBe("2026-07-14");

    root.unmount();
  });
});
