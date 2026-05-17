import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEventSourceBreakdownInRange, getFunnelCountsInRange } from "./funnel";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type Row = { event: string; properties?: Record<string, unknown>; created_at?: string };

function makeQuery(rows: Row[], orderMock = vi.fn()) {
  const query = {
    select: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    order: orderMock.mockImplementation(() => query),
    in: vi.fn((_column: string, events: string[]) => {
      rows = rows.filter((row) => events.includes(row.event));
      return query;
    }),
    range: vi.fn((from: number, to: number) =>
      Promise.resolve({ data: rows.slice(from, to + 1), error: null })
    ),
    then: (resolve: (value: { data: Row[]; error: null }) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: rows.slice(0, 1000), error: null }).then(resolve, reject),
  };
  return query;
}

describe("funnel stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts more than the Supabase default row limit", async () => {
    const rows = Array.from({ length: 1205 }, () => ({ event: "page_view" }));
    const orderMock = vi.fn();
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn(() => makeQuery(rows, orderMock)),
    } as never);

    const counts = await getFunnelCountsInRange(new Date("2026-05-01T00:00:00.000Z"));

    expect(counts.page_view).toBe(1205);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(orderMock).toHaveBeenCalledWith("id", { ascending: true });
  });

  it("builds source breakdowns beyond the Supabase default row limit", async () => {
    const rows = Array.from({ length: 1205 }, () => ({
      event: "shop_click",
      properties: { source: "winery-card" },
    }));
    const orderMock = vi.fn();
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn(() => makeQuery(rows, orderMock)),
    } as never);

    const breakdown = await getEventSourceBreakdownInRange(
      ["shop_click"],
      new Date("2026-05-01T00:00:00.000Z")
    );

    expect(breakdown.shop_click).toEqual([{ source: "winery-card", count: 1205 }]);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(orderMock).toHaveBeenCalledWith("id", { ascending: true });
  });
});
