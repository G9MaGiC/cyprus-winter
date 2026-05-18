import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

function mockBookingRows(rows: unknown[]) {
  const rangeCalls: Array<[number, number]> = [];
  const supabase = {
    from: vi.fn(() => {
      const builder = {
        select: vi.fn(() => builder),
        gte: vi.fn(() => builder),
        lt: vi.fn(() => builder),
        not: vi.fn(() => builder),
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

describe("partner revenue stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates billable bookings beyond Supabase's default first page", async () => {
    const rows = Array.from({ length: 1001 }, () => ({
      provider_id: "tsiakkas",
      provider_name: "Tsiakkas Winery",
      lead_fee_eur: 12,
    }));
    const { rangeCalls } = mockBookingRows(rows);

    const revenue = await getPartnerRevenueInRange(new Date("2026-05-01T00:00:00Z"));

    expect(revenue.totalRevenueEur).toBe(1001 * 12);
    expect(revenue.byPartner).toEqual([
      {
        providerId: "tsiakkas",
        providerName: "Tsiakkas Winery",
        bookingCount: 1001,
        totalFeeEur: 1001 * 12,
      },
    ]);
    expect(rangeCalls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });
});
