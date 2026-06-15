/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

describe("offline mutation queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not replay the same queued mutation twice during concurrent processing", async () => {
    const releases: Array<() => void> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        await new Promise<void>((release) => {
          releases.push(release);
        });
        return new Response(null, { status: 200 });
      })
    );

    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    const first = processQueue();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const second = processQueue();
    await Promise.resolve();
    releases.forEach((release) => release());

    await Promise.all([first, second]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
