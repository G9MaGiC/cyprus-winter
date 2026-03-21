import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the itinerary-share module
vi.mock("@/lib/itinerary-share", () => ({
  MAX_DAYS: 14,
  decodeItinerary: vi.fn(),
}));

import {
  emptyDays,
  loadItineraryFromStorage,
  loadItineraryFromUrl,
  persistItineraryToStorage,
  getItineraryStorageKey,
} from "./itinerary-storage";
import { decodeItinerary } from "@/lib/itinerary-share";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _reset: () => { store = {}; },
  };
})();

beforeEach(() => {
  localStorageMock._reset();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  vi.stubGlobal("window", { localStorage: localStorageMock });
  vi.stubGlobal("localStorage", localStorageMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("emptyDays", () => {
  it("returns object with keys 1 through 14", () => {
    const days = emptyDays();
    for (let d = 1; d <= 14; d++) {
      expect(days[d]).toEqual([]);
    }
    expect(Object.keys(days).length).toBe(14);
  });

  it("returns a fresh object each time", () => {
    const a = emptyDays();
    const b = emptyDays();
    expect(a).not.toBe(b);
    a[1].push("test");
    expect(b[1]).toEqual([]);
  });
});

describe("loadItineraryFromStorage", () => {
  it("returns empty days when nothing stored", () => {
    const result = loadItineraryFromStorage();
    expect(result).toEqual(emptyDays());
  });

  it("loads stored itinerary from localStorage", () => {
    const stored = { "1": ["place-a", "place-b"], "2": ["place-c"] };
    localStorageMock.setItem("cyprus-winter-itinerary", JSON.stringify(stored));
    const result = loadItineraryFromStorage();
    expect(result[1]).toEqual(["place-a", "place-b"]);
    expect(result[2]).toEqual(["place-c"]);
    expect(result[3]).toEqual([]);
  });

  it("ignores invalid day numbers (< 1 or > 14)", () => {
    const stored = { "0": ["bad"], "15": ["bad"], "1": ["good"] };
    localStorageMock.setItem("cyprus-winter-itinerary", JSON.stringify(stored));
    const result = loadItineraryFromStorage();
    expect(result[1]).toEqual(["good"]);
    expect(result[0]).toBeUndefined();
  });

  it("returns empty days on invalid JSON", () => {
    localStorageMock.setItem("cyprus-winter-itinerary", "not json");
    const result = loadItineraryFromStorage();
    expect(result).toEqual(emptyDays());
  });

  it("returns empty days when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    const result = loadItineraryFromStorage();
    expect(result).toEqual(emptyDays());
  });

  it("ignores non-array values for days", () => {
    const stored = { "1": "not-an-array", "2": ["valid"] };
    localStorageMock.setItem("cyprus-winter-itinerary", JSON.stringify(stored));
    const result = loadItineraryFromStorage();
    expect(result[1]).toEqual([]); // non-array rejected
    expect(result[2]).toEqual(["valid"]);
  });
});

describe("loadItineraryFromUrl", () => {
  it("delegates to decodeItinerary with plan param", () => {
    const mockDecode = vi.mocked(decodeItinerary);
    const mockResult = { 1: ["a"], 2: [] };
    mockDecode.mockReturnValue(mockResult as any);

    const params = new URLSearchParams("plan=encoded-value");
    const result = loadItineraryFromUrl(params);

    expect(mockDecode).toHaveBeenCalledWith("encoded-value");
    expect(result).toBe(mockResult);
  });

  it("passes null when no plan param", () => {
    const mockDecode = vi.mocked(decodeItinerary);
    mockDecode.mockReturnValue(null);

    const params = new URLSearchParams("");
    const result = loadItineraryFromUrl(params);

    expect(mockDecode).toHaveBeenCalledWith(null);
    expect(result).toBeNull();
  });
});

describe("persistItineraryToStorage", () => {
  it("stores days 1-14 in localStorage", () => {
    const days: Record<number, string[]> = emptyDays();
    days[1] = ["place-a"];
    days[3] = ["place-b", "place-c"];

    persistItineraryToStorage(days);

    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored["1"]).toEqual(["place-a"]);
    expect(stored["3"]).toEqual(["place-b", "place-c"]);
    expect(stored["2"]).toEqual([]);
  });

  it("uses correct storage key", () => {
    persistItineraryToStorage(emptyDays());
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "cyprus-winter-itinerary",
      expect.any(String)
    );
  });

  it("is a no-op when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    // Should not throw
    persistItineraryToStorage(emptyDays());
  });

  it("handles missing day entries gracefully", () => {
    const partial = { 1: ["a"] } as Record<number, string[]>;
    persistItineraryToStorage(partial);
    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    // Days without entries default to empty array
    expect(stored["2"]).toEqual([]);
  });
});

describe("getItineraryStorageKey", () => {
  it("returns the storage key", () => {
    expect(getItineraryStorageKey()).toBe("cyprus-winter-itinerary");
  });
});
