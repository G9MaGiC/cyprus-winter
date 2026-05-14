import { afterEach, describe, expect, it, vi } from "vitest";
import { getFunnelCountsInRange, getEventSourceBreakdownInRange } from "./funnel";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type Row = Record<string, unknown>;

class FakeSupabaseQuery implements PromiseLike<{ data: Row[]; error: null }> {
  private filters: Array<(row: Row) => boolean> = [];
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;

  constructor(private readonly rows: Row[]) {}

  select() {
    return this;
  }

  gte(column: string, value: string) {
    this.filters.push((row) => String(row[column]) >= value);
    return this;
  }

  lt(column: string, value: string) {
    this.filters.push((row) => String(row[column]) < value);
    return this;
  }

  in(column: string, values: string[]) {
    this.filters.push((row) => values.includes(String(row[column])));
    return this;
  }

  not(column: string, operator: string, value: null) {
    if (operator === "is" && value === null) {
      this.filters.push((row) => row[column] !== null && row[column] !== undefined);
    }
    return this;
  }

  range(from: number, to: number) {
    this.rangeStart = from;
    this.rangeEnd = to;
    return this;
  }

  then<TResult1 = { data: Row[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: Row[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute() {
    const filtered = this.rows.filter((row) => this.filters.every((filter) => filter(row)));
    const from = this.rangeStart ?? 0;
    const to = this.rangeEnd ?? 999;
    return { data: filtered.slice(from, to + 1), error: null };
  }
}

function mockSupabaseTables(tables: Record<string, Row[]>) {
  vi.mocked(getSupabase).mockReturnValue({
    from(table: string) {
      return new FakeSupabaseQuery(tables[table] ?? []);
    },
  } as never);
}

describe("stats Supabase pagination", () => {
  const start = new Date("2026-05-01T00:00:00.000Z");
  const end = new Date("2026-06-01T00:00:00.000Z");

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("counts conversion events beyond Supabase's first 1000 returned rows", async () => {
    mockSupabaseTables({
      conversion_events: Array.from({ length: 1005 }, (_, i) => ({
        event: i === 1004 ? "booking_complete" : "page_view",
        created_at: "2026-05-15T12:00:00.000Z",
      })),
    });

    const counts = await getFunnelCountsInRange(start, end);

    expect(counts.page_view).toBe(1004);
    expect(counts.booking_complete).toBe(1);
  });

  it("keeps source breakdown rows beyond Supabase's first 1000 returned rows", async () => {
    mockSupabaseTables({
      conversion_events: Array.from({ length: 1002 }, (_, i) => ({
        event: "shop_click",
        properties: { source: i >= 1000 ? "partner-footer" : "discover-card" },
        created_at: "2026-05-15T12:00:00.000Z",
      })),
    });

    const breakdown = await getEventSourceBreakdownInRange(["shop_click"], start, end);

    expect(breakdown.shop_click).toEqual([
      { source: "discover-card", count: 1000 },
      { source: "partner-footer", count: 2 },
    ]);
  });

  it("sums partner revenue beyond Supabase's first 1000 returned rows", async () => {
    mockSupabaseTables({
      bookings: Array.from({ length: 1001 }, (_, i) => ({
        provider_id: "tsiakkas",
        provider_name: "Tsiakkas Winery",
        lead_fee_eur: i === 1000 ? 7 : 5,
        created_at: "2026-05-15T12:00:00.000Z",
      })),
    });

    const revenue = await getPartnerRevenueInRange(start, end);

    expect(revenue.totalRevenueEur).toBe(5007);
    expect(revenue.byPartner).toEqual([
      {
        providerId: "tsiakkas",
        providerName: "Tsiakkas Winery",
        bookingCount: 1001,
        totalFeeEur: 5007,
      },
    ]);
  });
});
