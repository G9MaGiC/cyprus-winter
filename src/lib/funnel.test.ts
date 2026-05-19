import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabase } from "./supabase";
import { getFunnelCountsInRange } from "./funnel";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

function mockSupabaseRows<T>(rows: T[]) {
  return {
    from: vi.fn(() => {
      const query = {
        select: vi.fn(() => query),
        gte: vi.fn(() => query),
        lt: vi.fn(() => query),
        range: vi.fn(async (from: number, to: number) => ({
          data: rows.slice(from, to + 1),
          error: null,
        })),
      };
      return query;
    }),
  };
}

describe("funnel stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversion events beyond Supabase's default first page", async () => {
    const rows = Array.from({ length: 1001 }, () => ({ event: "plan_add" }));
    vi.mocked(getSupabase).mockReturnValue(mockSupabaseRows(rows) as never);

    await expect(getFunnelCountsInRange(new Date("2026-05-01T00:00:00Z"))).resolves.toEqual({
      plan_add: 1001,
    });
  });
});
