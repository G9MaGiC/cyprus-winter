/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useItinerary } from "./useItinerary";
import { encodeItinerary } from "@/lib/itinerary-share";
import { SITE_URL } from "@/lib/site-url";

const STORAGE_KEY = "cyprus-winter-itinerary";

/** Vitest + Node can expose a broken global `localStorage`; use a full in-memory impl. */
const memoryStore: Record<string, string> = {};

const navMocks = vi.hoisted(() => ({
  planParam: null as string | null,
}));

const clipboardMocks = vi.hoisted(() => ({
  writeText: vi.fn(),
}));

const mockSearchParams = vi.hoisted(() => ({
  get(key: string) {
    return key === "plan" ? navMocks.planParam : null;
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

const testMessages = {
  plan: {
    clipboard: {
      heading: "Cyprus Winter Itinerary",
      dayLabel: "Day {day}:",
      emptyFallback: "Your Cyprus Winter plan. Add places from Discover or Trails to get going.",
    },
  },
};

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={testMessages}>
      <Suspense fallback={null}>{children}</Suspense>
    </NextIntlClientProvider>
  );
}

function wipeLocalStorage() {
  for (const k of Object.keys(memoryStore)) delete memoryStore[k];
}

describe("useItinerary", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (k: string) => memoryStore[k] ?? null,
        setItem: (k: string, v: string) => {
          memoryStore[k] = v;
        },
        removeItem: (k: string) => {
          delete memoryStore[k];
        },
        clear: () => {
          wipeLocalStorage();
        },
        get length() {
          return Object.keys(memoryStore).length;
        },
        key: (i: number) => Object.keys(memoryStore)[i] ?? null,
      },
    });
  });

  beforeEach(() => {
    wipeLocalStorage();
    navMocks.planParam = null;
    clipboardMocks.writeText.mockClear();
    clipboardMocks.writeText.mockImplementation(() => Promise.resolve());
    vi.stubGlobal("navigator", {
      clipboard: { writeText: clipboardMocks.writeText },
    } as unknown as Navigator);
    
  });

  it("hydrates with empty days when no URL plan and no storage", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.days[1]).toEqual([]);
    expect(result.current.hasContent).toBe(false);
    expect(result.current.sharePath).toBe("/plan");
  });

  it("loads itinerary from localStorage when there is no plan query", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "1": ["kourion"], "2": [] })
    );

    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.days[1]).toEqual(["kourion"]);
    expect(result.current.hasContent).toBe(true);
  });

  it("prefers URL plan param over localStorage", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "1": ["kourion"], "2": [] })
    );
    navMocks.planParam = encodeItinerary({
      1: ["pafos-mosaics"],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
      13: [],
      14: [],
    });

    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.days[1]).toEqual(["pafos-mosaics"]);
  });

  it("toggleInDay adds a place on the active day and toggles off on second call", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggleInDay("kourion");
    });
    await waitFor(() =>
      expect(result.current.days[1]).toContain("kourion")
    );

    act(() => {
      result.current.toggleInDay("kourion");
    });
    await waitFor(() =>
      expect(result.current.days[1]).not.toContain("kourion")
    );
  });

  it("addToDayIfMissing adds only once per day", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.setActiveDay(2);
    });
    await waitFor(() => expect(result.current.activeDay).toBe(2));

    act(() => {
      result.current.addToDayIfMissing("kourion");
      result.current.addToDayIfMissing("kourion");
    });
    expect(result.current.days[2]?.filter((id) => id === "kourion").length).toBe(
      1
    );
  });

  it("removeFromDay removes only from active day", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });
    act(() => {
      result.current.setActiveDay(2);
    });
    await waitFor(() => expect(result.current.activeDay).toBe(2));
    act(() => {
      result.current.addToDayIfMissing("pafos-mosaics");
    });
    act(() => {
      result.current.setActiveDay(1);
    });
    await waitFor(() => expect(result.current.activeDay).toBe(1));
    act(() => {
      result.current.removeFromDay("kourion");
    });

    expect(result.current.days[1]).not.toContain("kourion");
    expect(result.current.days[2]).toContain("pafos-mosaics");
  });

  it("clearDay clears the active day only", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });
    act(() => {
      result.current.setActiveDay(2);
    });
    await waitFor(() => expect(result.current.activeDay).toBe(2));
    act(() => {
      result.current.addToDayIfMissing("artemis");
    });
    act(() => {
      result.current.setActiveDay(1);
    });
    await waitFor(() => expect(result.current.activeDay).toBe(1));
    act(() => {
      result.current.clearDay();
    });

    expect(result.current.days[1]).toEqual([]);
    expect(result.current.days[2]).toContain("artemis");
  });

  it("applyTemplate replaces without confirm when plan is empty", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.applyTemplate("short-stay");
    });

    expect(result.current.days[1]?.length).toBeGreaterThan(0);
    
  });

  it("applyTemplate replaces a non-empty plan directly", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });
    expect(result.current.hasContent).toBe(true);

    act(() => {
      result.current.applyTemplate("short-stay");
    });

    expect(result.current.days[1]).not.toEqual(["kourion"]);
  });

  it("mergeTemplate merges template IDs into existing days", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
      result.current.mergeTemplate("short-stay");
    });

    expect(result.current.days[1]).toContain("kourion");
    expect(result.current.days[1]?.some((id) => id === "pafos-mosaics")).toBe(
      true
    );
  });

  it("sets hasWineries when a winery is on the plan", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("tsiakkas");
    });

    expect(result.current.hasWineries).toBe(true);
  });

  it("persists days to localStorage after hydration", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });

    await waitFor(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!) as Record<string, string[]>;
      expect(parsed["1"]).toContain("kourion");
    });
  });

  it("copyItinerary writes formatted plan text and sets copied on success", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });

    await act(async () => {
      await result.current.copyItinerary();
    });

    expect(clipboardMocks.writeText).toHaveBeenCalledTimes(1);
    const text = clipboardMocks.writeText.mock.calls[0][0];
    expect(text).toContain("Cyprus Winter Itinerary");
    expect(text).toContain("Day 1:");
    expect(text).toContain("Kourion");
    expect(text).toContain("Limassol");
    expect(result.current.copied).toBe(true);
  });

  it("copyItinerary does not set copied when clipboard rejects", async () => {
    clipboardMocks.writeText.mockRejectedValueOnce(new Error("denied"));

    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });

    await act(async () => {
      await result.current.copyItinerary();
    });

    expect(result.current.copied).toBe(false);
  });

  it("copyShareLink writes absolute share URL and sets linkCopied", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.addToDayIfMissing("kourion");
    });

    await waitFor(() => expect(result.current.sharePath).not.toBe("/plan"));

    await act(async () => {
      await result.current.copyShareLink();
    });

    expect(clipboardMocks.writeText).toHaveBeenCalledTimes(1);
    const url = clipboardMocks.writeText.mock.calls[0][0];
    expect(url).toBe(`${SITE_URL}${result.current.sharePath}`);
    expect(url).toContain("/plan?plan=");
    expect(result.current.linkCopied).toBe(true);
  });

  it("copyShareLink uses base plan URL when empty", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.sharePath).toBe("/plan");

    await act(async () => {
      await result.current.copyShareLink();
    });

    expect(clipboardMocks.writeText).toHaveBeenCalledWith(`${SITE_URL}/plan`);
  });

  it("syncs days from storage events (cross-tab)", async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    const payload = JSON.stringify({
      "1": ["artemis"],
      "2": [],
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: payload,
        })
      );
    });

    await waitFor(() =>
      expect(result.current.days[1]).toEqual(["artemis"])
    );
  });
});
