import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEventSourceBreakdownInRange, getFunnelCountsInRange } from "./funnel";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type MockRow = Record<string, unknown>;

function createQuery(rows: MockRow[]) {
  let from = 0;
  let to = 999;
  let hasExplicitRange = false;

  const query = {
    select: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn((nextFrom: number, nextTo: number) => {
      from = nextFrom;
      to = nextTo;
      hasExplicitRange = true;
      return query;
    }),
    then: (resolve: (value: { data: MockRow[]; error: null }) => void) => {
      const page = hasExplicitRange ? rows.slice(from, to + 1) : rows.slice(0, 1000);
      return Promise.resolve(resolve({ data: page, error: null }));
    },
  };

  return query;
}

function mockSupabaseRows(rows: MockRow[]) {
  vi.mocked(getSupabase).mockReturnValue({
    from: vi.fn(() => createQuery(rows)),
  } as never);
}

describe("funnel Supabase aggregation", () => {
  const start = new Date("2026-05-01T00:00:00.000Z");
  const end = new Date("2026-06-01T00:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversion events beyond the Supabase default row cap", async () => {
    const rows = [
      ...Array.from({ length: 1000 }, () => ({ event: "page_view" })),
      ...Array.from({ length: 205 }, () => ({ event: "plan_add" })),
    ];
    mockSupabaseRows(rows);

    await expect(getFunnelCountsInRange(start, end)).resolves.toEqual({
      page_view: 1000,
      plan_add: 205,
    });
  });

  it("includes source breakdown rows beyond the Supabase default row cap", async () => {
    const rows = Array.from({ length: 1001 }, () => ({
      event: "plan_add",
      properties: { source: "guide" },
    }));
    mockSupabaseRows(rows);

    await expect(getEventSourceBreakdownInRange(["plan_add"], start, end)).resolves.toEqual({
      plan_add: [{ source: "guide", count: 1001 }],
    });
  });
});
