import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";
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
    not: vi.fn(() => query),
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

describe("getPartnerRevenueInRange", () => {
  const start = new Date("2026-05-01T00:00:00.000Z");
  const end = new Date("2026-06-01T00:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates billable bookings beyond the Supabase default row cap", async () => {
    mockSupabaseRows(
      Array.from({ length: 1001 }, () => ({
        provider_id: "tsiakkas",
        provider_name: "Tsiakkas Winery",
        lead_fee_eur: "5.00",
      }))
    );

    await expect(getPartnerRevenueInRange(start, end)).resolves.toEqual({
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
