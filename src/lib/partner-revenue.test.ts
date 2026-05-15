import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";

type BookingRevenueRow = {
  provider_id: string;
  provider_name: string;
  lead_fee_eur: number | null;
  created_at: string;
};

const supabaseState = vi.hoisted(() => ({
  client: null as { from: (table: string) => unknown } | null,
}));

vi.mock("./supabase", () => ({
  getSupabase: () => supabaseState.client,
}));

function createPagedSupabase(rows: BookingRevenueRow[]) {
  return {
    from(table: string) {
      expect(table).toBe("bookings");
      const filters: {
        startIso?: string;
        endIso?: string;
        requireLeadFee?: boolean;
        range?: { from: number; to: number };
      } = {};

      const builder = {
        select: vi.fn(() => builder),
        gte: vi.fn((_column: string, startIso: string) => {
          filters.startIso = startIso;
          return builder;
        }),
        lt: vi.fn((_column: string, endIso: string) => {
          filters.endIso = endIso;
          return builder;
        }),
        not: vi.fn((_column: string, _operator: string, value: null) => {
          if (value === null) filters.requireLeadFee = true;
          return builder;
        }),
        range: vi.fn((from: number, to: number) => {
          filters.range = { from, to };
          return builder;
        }),
        then(resolve: (value: { data: BookingRevenueRow[]; error: null }) => void) {
          let data = rows;
          if (filters.startIso) {
            data = data.filter((row) => row.created_at >= filters.startIso!);
          }
          if (filters.endIso) {
            data = data.filter((row) => row.created_at < filters.endIso!);
          }
          if (filters.requireLeadFee) {
            data = data.filter((row) => row.lead_fee_eur !== null);
          }
          const page = filters.range
            ? data.slice(filters.range.from, filters.range.to + 1)
            : data.slice(0, 1000);
          resolve({ data: page, error: null });
        },
      };
      return builder;
    },
  };
}

describe("partner revenue Supabase aggregation", () => {
  beforeEach(() => {
    supabaseState.client = null;
  });

  it("aggregates billable bookings beyond the Supabase default row cap", async () => {
    const rows = Array.from({ length: 1001 }, (): BookingRevenueRow => ({
      provider_id: "winery-1",
      provider_name: "Winter Winery",
      lead_fee_eur: 10,
      created_at: "2026-05-10T00:00:00.000Z",
    }));
    supabaseState.client = createPagedSupabase(rows);

    await expect(
      getPartnerRevenueInRange(new Date("2026-05-01T00:00:00.000Z"))
    ).resolves.toEqual({
      totalRevenueEur: 10010,
      byPartner: [
        {
          providerId: "winery-1",
          providerName: "Winter Winery",
          bookingCount: 1001,
          totalFeeEur: 10010,
        },
      ],
    });
  });
});
