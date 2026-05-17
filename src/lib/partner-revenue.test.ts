import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";
import { getSupabase } from "./supabase";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
}));

type BookingRow = {
  provider_id: string;
  provider_name: string;
  lead_fee_eur: number;
};

function makeQuery(rows: BookingRow[], orderMock = vi.fn()) {
  const query = {
    select: vi.fn(() => query),
    gte: vi.fn(() => query),
    lt: vi.fn(() => query),
    not: vi.fn(() => query),
    order: orderMock.mockImplementation(() => query),
    range: vi.fn((from: number, to: number) =>
      Promise.resolve({ data: rows.slice(from, to + 1), error: null })
    ),
    then: (
      resolve: (value: { data: BookingRow[]; error: null }) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve({ data: rows.slice(0, 1000), error: null }).then(resolve, reject),
  };
  return query;
}

describe("partner revenue stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates billable bookings beyond the Supabase default row limit", async () => {
    const rows = Array.from({ length: 1205 }, () => ({
      provider_id: "tsiakkas",
      provider_name: "Tsiakkas Winery",
      lead_fee_eur: 5,
    }));
    const orderMock = vi.fn();
    vi.mocked(getSupabase).mockReturnValue({
      from: vi.fn(() => makeQuery(rows, orderMock)),
    } as never);

    const revenue = await getPartnerRevenueInRange(new Date("2026-05-01T00:00:00.000Z"));

    expect(revenue.totalRevenueEur).toBe(6025);
    expect(revenue.byPartner).toEqual([
      {
        providerId: "tsiakkas",
        providerName: "Tsiakkas Winery",
        bookingCount: 1205,
        totalFeeEur: 6025,
      },
    ]);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(orderMock).toHaveBeenCalledWith("id", { ascending: true });
  });
});
