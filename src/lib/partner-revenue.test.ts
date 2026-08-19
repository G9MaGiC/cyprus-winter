import { afterEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type BookingRevenueRow = {
  provider_id: string;
  provider_name: string;
  lead_fee_eur: number;
};

function supabaseWithBookingRows(rows: BookingRevenueRow[]) {
  return {
    from: vi.fn(() => {
      let range: [number, number] | undefined;
      const query = {
        select: vi.fn(() => query),
        gte: vi.fn(() => query),
        not: vi.fn(() => query),
        lt: vi.fn(() => query),
        range: vi.fn((from: number, to: number) => {
          range = [from, to];
          return query;
        }),
        then: (
          onFulfilled: (value: { data: BookingRevenueRow[]; error: null }) => unknown,
          onRejected?: (reason: unknown) => unknown
        ) => {
          const data = range
            ? rows.slice(range[0], range[1] + 1)
            : rows.slice(0, 1000);
          return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
        },
      };
      return query;
    }),
  };
}

describe("getPartnerRevenueInRange", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("includes booking revenue beyond Supabase's default row cap", async () => {
    const rows = Array.from({ length: 1001 }, () => ({
      provider_id: "tsiakkas",
      provider_name: "Tsiakkas Winery",
      lead_fee_eur: 10,
    }));
    vi.mocked(getSupabase).mockReturnValue(
      supabaseWithBookingRows(rows) as unknown as ReturnType<typeof getSupabase>
    );

    const summary = await getPartnerRevenueInRange(new Date("2026-01-01T00:00:00.000Z"));

    expect(summary.totalRevenueEur).toBe(10010);
    expect(summary.byPartner).toEqual([
      {
        providerId: "tsiakkas",
        providerName: "Tsiakkas Winery",
        bookingCount: 1001,
        totalFeeEur: 10010,
      },
    ]);
  });
});
