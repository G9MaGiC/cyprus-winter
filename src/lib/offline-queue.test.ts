import { afterEach, describe, expect, it, vi } from "vitest";
import { processQueue } from "./offline-queue";

function stubLocalStorage(initialValue: string | null) {
  let stored = initialValue;
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => stored),
    setItem: vi.fn((_: string, value: string) => {
      stored = value;
    }),
  });

  return {
    getStored: () => stored,
  };
}

describe("processQueue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not replay queued mutations twice when processing starts concurrently", async () => {
    const queue = stubLocalStorage(
      JSON.stringify([
        {
          id: "mq-booking-1",
          type: "winery_booking",
          url: "/api/bookings",
          method: "POST",
          body: JSON.stringify({ providerId: "tsiakkas" }),
          createdAt: Date.now(),
        },
      ])
    );
    const fetchMock = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([processQueue(), processQueue()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queue.getStored()).toBe("[]");
  });
});
