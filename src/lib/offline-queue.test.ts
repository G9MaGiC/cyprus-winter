import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addMutation, getQueue, removeMutation, processQueue } from "./offline-queue";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    _store: store,
    _reset: () => { store = {}; },
  };
})();

// Mock fetch
const fetchMock = vi.fn();

beforeEach(() => {
  localStorageMock._reset();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  fetchMock.mockClear();
  vi.stubGlobal("window", { localStorage: localStorageMock });
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("addMutation", () => {
  it("adds a mutation to the queue", () => {
    addMutation({ type: "bookmark", url: "/api/bookmark", method: "POST", body: '{"id":"1"}' });
    const queue = getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].type).toBe("bookmark");
    expect(queue[0].url).toBe("/api/bookmark");
    expect(queue[0].method).toBe("POST");
    expect(queue[0].body).toBe('{"id":"1"}');
  });

  it("generates unique id and createdAt", () => {
    addMutation({ type: "test", url: "/api/test", method: "PUT" });
    const queue = getQueue();
    expect(queue[0].id).toMatch(/^mq-/);
    expect(queue[0].createdAt).toBeGreaterThan(0);
  });

  it("appends multiple mutations", () => {
    addMutation({ type: "a", url: "/a", method: "POST" });
    addMutation({ type: "b", url: "/b", method: "POST" });
    expect(getQueue().length).toBe(2);
  });

  it("trims queue to MAX_ITEMS (50)", () => {
    for (let i = 0; i < 55; i++) {
      addMutation({ type: `t${i}`, url: `/api/${i}`, method: "POST" });
    }
    const queue = getQueue();
    expect(queue.length).toBeLessThanOrEqual(50);
  });
});

describe("getQueue", () => {
  it("returns empty array when nothing stored", () => {
    expect(getQueue()).toEqual([]);
  });

  it("returns empty array on invalid JSON", () => {
    localStorageMock.setItem("cyprus-winter-offline-queue", "not json");
    // Re-mock getItem to return corrupted data
    localStorageMock.getItem.mockReturnValueOnce("not json");
    expect(getQueue()).toEqual([]);
  });

  it("returns empty array when stored value is not an array", () => {
    localStorageMock.getItem.mockReturnValueOnce('{"key":"value"}');
    expect(getQueue()).toEqual([]);
  });
});

describe("removeMutation", () => {
  it("removes a mutation by id", () => {
    addMutation({ type: "a", url: "/a", method: "POST" });
    addMutation({ type: "b", url: "/b", method: "POST" });
    const queue = getQueue();
    removeMutation(queue[0].id);
    const updated = getQueue();
    expect(updated.length).toBe(1);
    expect(updated[0].type).toBe("b");
  });

  it("does nothing when id not found", () => {
    addMutation({ type: "a", url: "/a", method: "POST" });
    removeMutation("nonexistent-id");
    expect(getQueue().length).toBe(1);
  });
});

describe("processQueue", () => {
  it("returns 0/0 when queue is empty", async () => {
    const result = await processQueue();
    expect(result).toEqual({ processed: 0, succeeded: 0 });
  });

  it("retries mutations and removes successful ones", async () => {
    addMutation({ type: "a", url: "/api/a", method: "POST", body: '{"x":1}' });
    addMutation({ type: "b", url: "/api/b", method: "PUT" });

    fetchMock.mockResolvedValue({ ok: true });

    const result = await processQueue();
    expect(result.processed).toBe(2);
    expect(result.succeeded).toBe(2);
    expect(getQueue().length).toBe(0);
  });

  it("keeps failed mutations in the queue", async () => {
    addMutation({ type: "a", url: "/api/a", method: "POST" });

    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await processQueue();
    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(0);
    expect(getQueue().length).toBe(1);
  });

  it("keeps mutations on network error", async () => {
    addMutation({ type: "a", url: "/api/a", method: "POST" });

    fetchMock.mockRejectedValue(new Error("Network error"));

    const result = await processQueue();
    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(0);
    expect(getQueue().length).toBe(1);
  });

  it("calls fetch with correct params", async () => {
    addMutation({ type: "a", url: "/api/a", method: "POST", body: '{"id":"1"}' });
    fetchMock.mockResolvedValue({ ok: true });

    await processQueue();

    expect(fetchMock).toHaveBeenCalledWith("/api/a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"id":"1"}',
    });
  });

  it("passes undefined body when not set", async () => {
    addMutation({ type: "a", url: "/api/a", method: "DELETE" });
    fetchMock.mockResolvedValue({ ok: true });

    await processQueue();

    expect(fetchMock).toHaveBeenCalledWith("/api/a", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: undefined,
    });
  });

  it("handles mixed success and failure", async () => {
    addMutation({ type: "a", url: "/api/a", method: "POST" });
    addMutation({ type: "b", url: "/api/b", method: "POST" });

    fetchMock
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    const result = await processQueue();
    expect(result.processed).toBe(2);
    expect(result.succeeded).toBe(1);
  });
});

describe("server-side (no window)", () => {
  it("returns empty queue when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(getQueue()).toEqual([]);
  });

  it("addMutation is a no-op when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    // Should not throw
    addMutation({ type: "a", url: "/a", method: "POST" });
  });
});
