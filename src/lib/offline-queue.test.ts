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
      body: JSON.stringify({ bookingId: "offline-1" }),
    });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await Promise.all([processQueue(), processQueue()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("[]");
  });
});
