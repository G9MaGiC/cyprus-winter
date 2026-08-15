/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

const STORAGE_KEY = "cyprus-winter-offline-queue";

describe("processQueue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("does not double-submit the same queued booking when called concurrently", async () => {
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });
    expect(getQueue()).toHaveLength(1);

    let inFlight = 0;
    let peakInFlight = 0;
    let submissions = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        submissions += 1;
        inFlight += 1;
        peakInFlight = Math.max(peakInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 30));
        inFlight -= 1;
        return { ok: true } as Response;
      })
    );

    await Promise.all([processQueue(), processQueue()]);

    expect(submissions).toBe(1);
    expect(peakInFlight).toBe(1);
    expect(getQueue()).toHaveLength(0);
    expect(localStorage.getItem(STORAGE_KEY) == null || getQueue().length === 0).toBe(true);
  });
});
