import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getItineraryForChat } from "./itinerary-for-chat";

describe("getItineraryForChat", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    // Restore window
    if (originalWindow === undefined) {
      // @ts-expect-error -- test cleanup
      delete globalThis.window;
    }
    vi.restoreAllMocks();
  });

  it("returns empty array when window is undefined (SSR)", () => {
    // @ts-expect-error -- simulate SSR
    delete globalThis.window;
    expect(getItineraryForChat()).toEqual([]);
  });

  it("returns empty array when nothing in localStorage", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    const mockStorage: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    expect(getItineraryForChat()).toEqual([]);
  });

  it("parses valid itinerary from localStorage", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    const data = { "1": ["omodos", "lefkara"], "3": ["troodos"] };
    globalThis.localStorage = {
      getItem: (key: string) =>
        key === "cyprus-winter-itinerary" ? JSON.stringify(data) : null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    const result = getItineraryForChat();
    expect(result).toEqual([
      { day: 1, placeIds: ["omodos", "lefkara"] },
      { day: 3, placeIds: ["troodos"] },
    ]);
  });

  it("skips days with no valid place IDs", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    const data = { "1": [123, null, true], "2": ["valid"] };
    globalThis.localStorage = {
      getItem: () => JSON.stringify(data),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    const result = getItineraryForChat();
    expect(result).toEqual([{ day: 2, placeIds: ["valid"] }]);
  });

  it("limits to MAX_DAYS (14)", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    const data: Record<string, string[]> = {};
    for (let i = 1; i <= 20; i++) data[String(i)] = [`place-${i}`];
    globalThis.localStorage = {
      getItem: () => JSON.stringify(data),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    const result = getItineraryForChat();
    expect(result).toHaveLength(14);
    expect(result[result.length - 1].day).toBe(14);
  });

  it("limits placeIds per day to 20", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    const manyPlaces = Array.from({ length: 25 }, (_, i) => `place-${i}`);
    globalThis.localStorage = {
      getItem: () => JSON.stringify({ "1": manyPlaces }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    const result = getItineraryForChat();
    expect(result[0].placeIds).toHaveLength(20);
  });

  it("returns empty array on JSON parse error", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: () => "not-valid-json{",
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    expect(getItineraryForChat()).toEqual([]);
  });

  it("returns empty array when parsed value is not an object", () => {
    // @ts-expect-error -- mock window
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: () => '"just a string"',
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    expect(getItineraryForChat()).toEqual([]);
  });
});
