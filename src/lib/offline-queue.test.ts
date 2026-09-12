import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addMutation,
  getQueue,
  processQueue,
  OFFLINE_QUEUE_DRAINED_EVENT,
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
    expect((droppedEvents[0] as CustomEvent).detail).toEqual({
      dropped: 1,
      types: ["winery_booking"],
    });
  });

  it("fires DROPPED before DRAINED on a mixed drain so a rejected booking fails safe", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      // First queued item (trail report) delivers, second (booking) is rejected.
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 422 }));
    const order: string[] = [];
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      localStorage: storage,
      dispatchEvent: (e: Event) => {
        order.push(e.type);
        return true;
      },
    });

    addMutation({ type: "trail_report", url: "/api/trail-reports", method: "POST", body: "{}" });
    addMutation({ type: "winery_booking", url: "/api/bookings", method: "POST", body: "{}" });

    await processQueue();

    expect(order).toEqual([OFFLINE_QUEUE_DROPPED_EVENT, OFFLINE_QUEUE_DRAINED_EVENT]);
  });

  it("replaces a queued booking that shares an idempotency key instead of appending an amended payload", async () => {
    const key = "same-offline-booking-key";
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: key,
        date: "2099-04-01",
        providerId: "tsiakkas",
      }),
    });
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({
        idempotencyKey: key,
        date: "2099-04-02",
        providerId: "tsiakkas",
      }),
    });

    expect(getQueue()).toHaveLength(1);
    expect(JSON.parse(getQueue()[0]?.body ?? "{}").date).toBe("2099-04-02");

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ booking: { id: "bk-amended" } }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await processQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(sent.date).toBe("2099-04-02");
    expect(getQueue()).toEqual([]);
  });

  it("still queues distinct bookings that use different idempotency keys", () => {
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ idempotencyKey: "key-a", providerId: "tsiakkas" }),
    });
    addMutation({
      type: "winery_booking",
      url: "/api/bookings",
      method: "POST",
      body: JSON.stringify({ idempotencyKey: "key-b", providerId: "tsiakkas" }),
    });

    expect(getQueue()).toHaveLength(2);
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
