import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addMutation,
  getQueue,
  processQueue,
  OFFLINE_QUEUE_DROPPED_EVENT,
} from "./offline-queue";

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

  it("rejects non-API queue targets", () => {
    addMutation({
      type: "unsafe",
      url: "https://evil.example/collect",
      method: "POST",
      body: "{}",
    });

    expect(getQueue()).toEqual([]);
  });

  it("removes permanent client errors instead of retrying forever", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);

    addMutation({
      type: "invalid",
      url: "/api/bookings",
      method: "POST",
      body: "{}",
    });

    await processQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getQueue()).toEqual([]);
  });

  it("announces permanently dropped mutations instead of discarding silently (AUD-21)", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 422 }));
    const dispatched: Event[] = [];
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      localStorage: storage,
      dispatchEvent: (e: Event) => {
        dispatched.push(e);
        return true;
      },
    });

    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: "{}",
    });

    await processQueue();

    expect(getQueue()).toEqual([]);
    const droppedEvents = dispatched.filter((e) => e.type === OFFLINE_QUEUE_DROPPED_EVENT);
    expect(droppedEvents).toHaveLength(1);
    expect((droppedEvents[0] as CustomEvent).detail).toEqual({ dropped: 1 });
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

  it("stores the created booking locally when a drained booking succeeds (AUD B2-06)", async () => {
    const created = {
      id: "bk-drained",
      type: "winery_tasting",
      providerId: "tsiakkas",
      providerName: "Tsiakkas",
      date: "2026-03-15",
      partySize: 2,
      status: "pending",
      createdAt: "2026-03-12T10:00:00Z",
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ booking: created }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ providerId: "tsiakkas" }),
    });

    await processQueue();

    expect(getQueue()).toEqual([]);
    const stored = JSON.parse(storage.getItem("cyprus-bookings") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("bk-drained");
  });
});
