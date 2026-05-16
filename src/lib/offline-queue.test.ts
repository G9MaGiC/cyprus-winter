/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, processQueue } from "./offline-queue";

const STORAGE_KEY = "cyprus-winter-offline-queue";

describe("offline queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not replay the same queued mutation twice when processors overlap", async () => {
    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    let resolveFetch: (value: Response) => void = () => {};
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => fetchPromise);

    const first = processQueue();
    const second = processQueue();

    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(new Response(null, { status: 200 }));

    await expect(first).resolves.toEqual({ processed: 1, succeeded: 1 });
    await expect(second).resolves.toEqual({ processed: 0, succeeded: 0 });
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([]));
  });
});
