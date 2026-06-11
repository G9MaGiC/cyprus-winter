/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "@/lib/offline-queue";

describe("offline queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not replay the same queued mutation twice when processors run concurrently", async () => {
    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ email: "guest@example.com" }),
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 200 })))
    );

    const [first, second] = await Promise.all([processQueue(), processQueue()]);

    expect(first).toEqual({ processed: 1, succeeded: 1 });
    expect(second).toEqual({ processed: 0, succeeded: 0 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
