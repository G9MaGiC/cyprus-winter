import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, processQueue } from "./offline-queue";

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
  vi.stubGlobal("window", { localStorage });
  vi.stubGlobal("localStorage", localStorage);
}

describe("processQueue", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not replay the same queued mutation twice when processing starts concurrently", async () => {
    addMutation({
      type: "booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    const pendingFetches: Array<(response: Response) => void> = [];
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          pendingFetches.push(resolve);
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = processQueue();
    const second = processQueue();
    const replayCount = fetchMock.mock.calls.length;

    pendingFetches.forEach((resolve) => resolve(new Response(null, { status: 200 })));
    await Promise.all([first, second]);

    expect(replayCount).toBe(1);
  });
});
