import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import { getFunnelCountsThisMonth } from "./funnel";
import { getSupabase } from "./supabase";

const mockGetSupabase = vi.mocked(getSupabase);

describe("getFunnelCountsThisMonth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ gte: mockGte });
  });

  it("returns empty object when supabase is null", async () => {
    mockGetSupabase.mockReturnValue(null as any);
    const result = await getFunnelCountsThisMonth();
    expect(result).toEqual({});
  });

  it("queries conversion_events from first of current month", async () => {
    mockGte.mockResolvedValue({ data: [], error: null });

    await getFunnelCountsThisMonth();

    expect(mockFrom).toHaveBeenCalledWith("conversion_events");
    expect(mockSelect).toHaveBeenCalledWith("event");
    expect(mockGte).toHaveBeenCalledWith("created_at", expect.any(String));

    // Verify the date is first of month
    const isoArg = mockGte.mock.calls[0][1] as string;
    const date = new Date(isoArg);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it("counts events correctly", async () => {
    mockGte.mockResolvedValue({
      data: [
        { event: "page_view" },
        { event: "page_view" },
        { event: "page_view" },
        { event: "booking_start" },
        { event: "booking_complete" },
      ],
      error: null,
    });

    const result = await getFunnelCountsThisMonth();
    expect(result).toEqual({
      page_view: 3,
      booking_start: 1,
      booking_complete: 1,
    });
  });

  it("returns empty object on query error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGte.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const result = await getFunnelCountsThisMonth();
    expect(result).toEqual({});
    expect(consoleErrorSpy).toHaveBeenCalledWith("Funnel query error:", expect.anything());
    consoleErrorSpy.mockRestore();
  });

  it("handles null data gracefully", async () => {
    mockGte.mockResolvedValue({ data: null, error: null });
    const result = await getFunnelCountsThisMonth();
    expect(result).toEqual({});
  });

  it("trims and filters empty event names", async () => {
    mockGte.mockResolvedValue({
      data: [
        { event: "  page_view  " },
        { event: "" },
        { event: null },
        { event: undefined },
        { event: "booking_start" },
      ],
      error: null,
    });

    const result = await getFunnelCountsThisMonth();
    expect(result).toEqual({
      page_view: 1,
      booking_start: 1,
    });
    // Empty/null/undefined events should not appear
    expect(result[""]).toBeUndefined();
  });
});
