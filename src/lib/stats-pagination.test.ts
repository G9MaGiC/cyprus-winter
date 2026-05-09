import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEventSourceBreakdownInRange, getFunnelCountsInRange } from "./funnel";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type QueryRow = Record<string, unknown>;
type QueryResult = { data: QueryRow[]; error: null };
type ChainMethod = ReturnType<typeof vi.fn<(...args: unknown[]) => MockBuilder>>;
type RangeCall = { table: string; from: number; to: number };

type MockBuilder = PromiseLike<QueryResult> & {
  select: ChainMethod;
  gte: ChainMethod;
  lt: ChainMethod;
  in: ChainMethod;
  not: ChainMethod;
  order: ChainMethod;
  range: ReturnType<typeof vi.fn<(from: number, to: number) => MockBuilder>>;
};

function createBuilder(
  table: string,
  rows: QueryRow[],
  rangeCalls: RangeCall[],
  defaultLimit = 1000
): MockBuilder {
  let rangeFrom: number | undefined;
  let rangeTo: number | undefined;
  let builder: MockBuilder;

  const chain = () => builder;
  builder = {
    select: vi.fn(chain),
    gte: vi.fn(chain),
    lt: vi.fn(chain),
    in: vi.fn(chain),
    not: vi.fn(chain),
    order: vi.fn(chain),
    range: vi.fn((from: number, to: number) => {
      rangeFrom = from;
      rangeTo = to;
      rangeCalls.push({ table, from, to });
      return builder;
    }),
    then<TResult1 = QueryResult, TResult2 = never>(
      onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
      const data =
        rangeFrom === undefined || rangeTo === undefined
          ? rows.slice(0, defaultLimit)
          : rows.slice(rangeFrom, rangeTo + 1);
      return Promise.resolve({ data, error: null }).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

function mockSupabase(tables: Record<string, QueryRow[]>) {
  const rangeCalls: RangeCall[] = [];
  const supabase = {
    from: vi.fn((table: string) => createBuilder(table, tables[table] ?? [], rangeCalls)),
  };

  vi.mocked(getSupabase).mockReturnValue(supabase as ReturnType<typeof getSupabase>);
  return { rangeCalls };
}

describe("stats Supabase pagination", () => {
  const start = new Date("2026-05-01T00:00:00.000Z");
  const end = new Date("2026-06-01T00:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversion events beyond Supabase's default returned-row cap", async () => {
    const rows = [
      ...Array.from({ length: 1002 }, () => ({ event: "page_view" })),
      ...Array.from({ length: 3 }, () => ({ event: "booking_complete" })),
    ];
    const { rangeCalls } = mockSupabase({ conversion_events: rows });

    const counts = await getFunnelCountsInRange(start, end);

    expect(counts.page_view).toBe(1002);
    expect(counts.booking_complete).toBe(3);
    expect(rangeCalls).toEqual([
      { table: "conversion_events", from: 0, to: 999 },
      { table: "conversion_events", from: 1000, to: 1999 },
    ]);
  });

  it("includes source breakdown rows beyond Supabase's default returned-row cap", async () => {
    const rows = [
      ...Array.from({ length: 1000 }, () => ({
        event: "shop_click",
        properties: { source: "direct" },
      })),
      { event: "plan_add", properties: { source: "ai" } },
    ];
    const { rangeCalls } = mockSupabase({ conversion_events: rows });

    const breakdown = await getEventSourceBreakdownInRange(["shop_click", "plan_add"], start, end);

    expect(breakdown.shop_click).toEqual([{ source: "direct", count: 1000 }]);
    expect(breakdown.plan_add).toEqual([{ source: "ai", count: 1 }]);
    expect(rangeCalls).toEqual([
      { table: "conversion_events", from: 0, to: 999 },
      { table: "conversion_events", from: 1000, to: 1999 },
    ]);
  });

  it("sums partner lead fees beyond Supabase's default returned-row cap", async () => {
    const rows = [
      ...Array.from({ length: 1000 }, () => ({
        provider_id: "winery-a",
        provider_name: "Winery A",
        lead_fee_eur: 1,
      })),
      {
        provider_id: "winery-b",
        provider_name: "Winery B",
        lead_fee_eur: 10,
      },
    ];
    const { rangeCalls } = mockSupabase({ bookings: rows });

    const revenue = await getPartnerRevenueInRange(start, end);

    expect(revenue.totalRevenueEur).toBe(1010);
    expect(revenue.byPartner).toContainEqual({
      providerId: "winery-b",
      providerName: "Winery B",
      bookingCount: 1,
      totalFeeEur: 10,
    });
    expect(rangeCalls).toEqual([
      { table: "bookings", from: 0, to: 999 },
      { table: "bookings", from: 1000, to: 1999 },
    ]);
  });
});
