/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

describe("offline queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not replay the same queued mutation twice during concurrent drains", async () => {
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ guestEmail: "guest@example.com" }),
    });

    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([processQueue(), processQueue()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
