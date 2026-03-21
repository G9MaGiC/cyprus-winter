import { describe, it, expect, vi, beforeEach } from "vitest";
import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { MAX_DAYS } from "@/lib/itinerary-share";

// We test the re-exported constants and the WINTER_TEMPLATES derived value
// The hook itself uses React internals, so we mock React and test logic flows

// Mock all React hooks
vi.mock("react", () => ({
  useState: vi.fn((init: unknown) => [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()]),
  useEffect: vi.fn(),
  useCallback: vi.fn((fn: unknown) => fn),
  useRef: vi.fn((val: unknown) => ({ current: val })),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/lib/analytics", () => ({
  trackProduct: vi.fn(),
}));

vi.mock("@/lib/itinerary-storage", () => ({
  emptyDays: vi.fn(() => {
    const out: Record<number, string[]> = {};
    for (let d = 1; d <= 14; d++) out[d] = [];
    return out;
  }),
  loadItineraryFromStorage: vi.fn(() => {
    const out: Record<number, string[]> = {};
    for (let d = 1; d <= 14; d++) out[d] = [];
    return out;
  }),
  loadItineraryFromUrl: vi.fn(() => null),
  persistItineraryToStorage: vi.fn(),
  getItineraryStorageKey: vi.fn(() => "cyprus-winter-itinerary"),
}));

vi.mock("@/lib/site-url", () => ({
  toAbsoluteUrl: vi.fn((path: string) => `https://cyprus-winter.com${path}`),
}));

describe("useItinerary module exports", () => {
  it("re-exports MAX_DAYS as 14", () => {
    expect(MAX_DAYS).toBe(14);
  });

  it("re-exports ITINERARY_TEMPLATES as an array", () => {
    expect(Array.isArray(ITINERARY_TEMPLATES)).toBe(true);
    expect(ITINERARY_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("each template has required fields", () => {
    for (const t of ITINERARY_TEMPLATES) {
      expect(t).toHaveProperty("key");
      expect(t).toHaveProperty("label");
      expect(t).toHaveProperty("description");
      expect(t).toHaveProperty("duration");
      expect(t).toHaveProperty("days");
      expect(typeof t.key).toBe("string");
      expect(typeof t.duration).toBe("number");
      expect(t.duration).toBeGreaterThan(0);
    }
  });
});

describe("WINTER_TEMPLATES (deprecated re-export)", () => {
  it("is a Record derived from ITINERARY_TEMPLATES", async () => {
    // Import the deprecated export
    const { WINTER_TEMPLATES } = await import("@/hooks/useItinerary");
    expect(typeof WINTER_TEMPLATES).toBe("object");
    // Each key in WINTER_TEMPLATES should match a template key
    for (const t of ITINERARY_TEMPLATES) {
      expect(WINTER_TEMPLATES).toHaveProperty(t.key);
      expect(WINTER_TEMPLATES[t.key]).toEqual(t.days);
    }
  });

  it("has the same number of entries as ITINERARY_TEMPLATES", async () => {
    const { WINTER_TEMPLATES } = await import("@/hooks/useItinerary");
    expect(Object.keys(WINTER_TEMPLATES).length).toBe(ITINERARY_TEMPLATES.length);
  });
});

describe("useItinerary hook logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can be imported without error", async () => {
    const mod = await import("@/hooks/useItinerary");
    expect(typeof mod.useItinerary).toBe("function");
  });

  it("hook returns expected shape when invoked", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();

    // Verify returned object has all expected keys
    expect(result).toHaveProperty("days");
    expect(result).toHaveProperty("activeDay");
    expect(result).toHaveProperty("hydrated");
    expect(result).toHaveProperty("copied");
    expect(result).toHaveProperty("linkCopied");
    expect(result).toHaveProperty("hasContent");
    expect(result).toHaveProperty("hasWineries");
    expect(result).toHaveProperty("sharePath");
    expect(result).toHaveProperty("toggleInDay");
    expect(result).toHaveProperty("addToDayIfMissing");
    expect(result).toHaveProperty("removeFromDay");
    expect(result).toHaveProperty("getPlace");
    expect(result).toHaveProperty("applyTemplate");
    expect(result).toHaveProperty("mergeTemplate");
    expect(result).toHaveProperty("clearDay");
    expect(result).toHaveProperty("copyItinerary");
    expect(result).toHaveProperty("copyShareLink");
  });

  it("initial days are empty", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();
    for (let d = 1; d <= MAX_DAYS; d++) {
      expect(result.days[d]).toEqual([]);
    }
  });

  it("hasContent is false when days are empty", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();
    expect(result.hasContent).toBe(false);
  });

  it("hasWineries is false when days are empty", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();
    expect(result.hasWineries).toBe(false);
  });

  it("sharePath defaults to /plan when no content", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();
    expect(result.sharePath).toBe("/plan");
  });

  it("activeDay defaults to 1", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    const result = useItinerary();
    expect(result.activeDay).toBe(1);
  });
});
