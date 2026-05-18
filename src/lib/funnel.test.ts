import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEventSourceBreakdownInRange,
  getFunnelCountsInRange,
} from "./funnel";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

function mockSupabaseRows(rows: unknown[]) {
  const rangeCalls: Array<[number, number]> = [];
  const supabase = {
    from: vi.fn(() => {
      const builder = {
        select: vi.fn(() => builder),
        gte: vi.fn(() => builder),
        lt: vi.fn(() => builder),
        in: vi.fn(() => builder),
        range: vi.fn(async (from: number, to: number) => {
          rangeCalls.push([from, to]);
          return { data: rows.slice(from, to + 1), error: null };
        }),
      };
      return builder;
    }),
  };
  vi.mocked(getSupabase).mockReturnValue(supabase as unknown as ReturnType<typeof getSupabase>);
  return { rangeCalls };
}

describe("funnel stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversion events beyond Supabase's default first page", async () => {
    const rows = Array.from({ length: 1001 }, () => ({ event: "plan_add" }));
    const { rangeCalls } = mockSupabaseRows(rows);

    const counts = await getFunnelCountsInRange(new Date("2026-05-01T00:00:00Z"));

    expect(counts.plan_add).toBe(1001);
    expect(rangeCalls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });

  it("builds source breakdowns beyond Supabase's default first page", async () => {
    const rows = Array.from({ length: 1001 }, (_, i) => ({
      event: "shop_click",
      properties: { source: i % 2 === 0 ? "card" : "detail" },
    }));
    mockSupabaseRows(rows);

    const breakdown = await getEventSourceBreakdownInRange(
      ["shop_click"],
      new Date("2026-05-01T00:00:00Z")
    );

    const total = breakdown.shop_click.reduce((sum, row) => sum + row.count, 0);
    expect(total).toBe(1001);
  });
});
