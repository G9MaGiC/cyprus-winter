/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

describe("offline mutation queue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serializes concurrent processing so a queued mutation is posted once", async () => {
    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ bookingId: "offline-booking-1" }),
    });

    let resolveFetch: (response: Response) => void = () => {};
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn(() => fetchPromise);
    vi.stubGlobal("fetch", fetchMock);

    const first = processQueue();
    const second = processQueue();

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(new Response(null, { status: 200 }));
    await expect(Promise.all([first, second])).resolves.toEqual([
      { processed: 1, succeeded: 1 },
      { processed: 1, succeeded: 1 },
    ]);
    expect(getQueue()).toEqual([]);
  });
});
