/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

describe("offline queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent queue processing so mutations are not replayed twice", async () => {
    let resolveFetch!: () => void;
    const fetchDone = new Promise<Response>((resolve) => {
      resolveFetch = () => resolve(new Response(null, { status: 200 }));
    });
    const fetchMock = vi.fn(() => fetchDone);
    vi.stubGlobal("fetch", fetchMock);

    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
      idempotencyKey: "mq-original-submit",
    });

    const first = processQueue();
    const second = processQueue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("Idempotency-Key")).toBe("mq-original-submit");

    resolveFetch();
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toEqual({ processed: 1, succeeded: 1 });
    expect(secondResult).toEqual({ processed: 1, succeeded: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
