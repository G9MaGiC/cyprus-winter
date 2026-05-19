import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

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
        not: vi.fn(() => query),
        range: vi.fn(async (from: number, to: number) => ({
          data: rows.slice(from, to + 1),
          error: null,
        })),
      };
      return query;
    }),
  };
}

describe("partner revenue stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sums billable bookings beyond Supabase's default first page", async () => {
    const rows = Array.from({ length: 1001 }, () => ({
      provider_id: "tsiakkas",
      provider_name: "Tsiakkas Winery",
      lead_fee_eur: 5,
    }));
    vi.mocked(getSupabase).mockReturnValue(mockSupabaseRows(rows) as never);

    await expect(getPartnerRevenueInRange(new Date("2026-05-01T00:00:00Z"))).resolves.toEqual({
      totalRevenueEur: 5005,
      byPartner: [
        {
          providerId: "tsiakkas",
          providerName: "Tsiakkas Winery",
          bookingCount: 1001,
          totalFeeEur: 5005,
        },
      ],
    });
  });
});
