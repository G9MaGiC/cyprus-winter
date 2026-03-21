import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getRecentlyViewed, addToRecentlyViewed, clearRecentlyViewed } from "./recently-viewed";

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
  localStorageMock.removeItem.mockClear();
  vi.stubGlobal("window", { localStorage: localStorageMock });
  vi.stubGlobal("localStorage", localStorageMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getRecentlyViewed", () => {
  it("returns empty array when nothing stored", () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("returns empty array when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("returns stored items", () => {
    const items = [
      { id: "1", name: "Place 1", type: "attraction", region: "Paphos", viewedAt: "2025-01-01T00:00:00Z" },
    ];
    localStorageMock.setItem("cyprus-recently-viewed", JSON.stringify(items));
    expect(getRecentlyViewed()).toEqual(items);
  });

  it("returns empty array on invalid JSON", () => {
    localStorageMock.setItem("cyprus-recently-viewed", "bad json");
    localStorageMock.getItem.mockReturnValueOnce("bad json");
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("returns empty array if stored value is not an array", () => {
    localStorageMock.getItem.mockReturnValueOnce('{"not":"array"}');
    expect(getRecentlyViewed()).toEqual([]);
  });
});

describe("addToRecentlyViewed", () => {
  it("adds an item with viewedAt timestamp", () => {
    addToRecentlyViewed({ id: "1", name: "Place 1", type: "attraction", region: "Paphos" });
    const items = getRecentlyViewed();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe("1");
    expect(items[0].name).toBe("Place 1");
    expect(items[0].viewedAt).toBeTruthy();
  });

  it("adds new items at the beginning (most recent first)", () => {
    addToRecentlyViewed({ id: "1", name: "First", type: "attraction", region: "R1" });
    addToRecentlyViewed({ id: "2", name: "Second", type: "trail", region: "R2" });
    const items = getRecentlyViewed();
    expect(items[0].id).toBe("2");
    expect(items[1].id).toBe("1");
  });

  it("moves existing item to top if re-viewed", () => {
    addToRecentlyViewed({ id: "1", name: "First", type: "attraction", region: "R1" });
    addToRecentlyViewed({ id: "2", name: "Second", type: "trail", region: "R2" });
    addToRecentlyViewed({ id: "1", name: "First Updated", type: "attraction", region: "R1" });
    const items = getRecentlyViewed();
    expect(items.length).toBe(2);
    expect(items[0].id).toBe("1");
    expect(items[1].id).toBe("2");
  });

  it("limits to 10 items", () => {
    for (let i = 0; i < 15; i++) {
      addToRecentlyViewed({ id: `id-${i}`, name: `Place ${i}`, type: "attraction", region: "R" });
    }
    const items = getRecentlyViewed();
    expect(items.length).toBe(10);
    // Most recently added should be first
    expect(items[0].id).toBe("id-14");
  });

  it("is a no-op when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    // Should not throw
    addToRecentlyViewed({ id: "1", name: "Test", type: "attraction", region: "R" });
  });
});

describe("clearRecentlyViewed", () => {
  it("removes stored items", () => {
    addToRecentlyViewed({ id: "1", name: "Place", type: "attraction", region: "R" });
    clearRecentlyViewed();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("cyprus-recently-viewed");
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("is a no-op when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    // Should not throw
    clearRecentlyViewed();
  });
});
