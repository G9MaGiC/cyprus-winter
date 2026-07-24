import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addMutation, getQueue, processQueue } from "./offline-queue";

class MemoryStorage {
  private readonly store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  clear() {
    this.store.clear();
  }
}

describe("offline queue", () => {
  const storage = new MemoryStorage();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent queue processors so a booking mutation posts once", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    await Promise.all([processQueue(), processQueue()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });
});
