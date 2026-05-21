/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

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
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([processQueue(), processQueue()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
