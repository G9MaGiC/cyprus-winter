import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPartnerRevenueInRange } from "./partner-revenue";

const getSupabaseMock = vi.hoisted(() => vi.fn());

vi.mock("./supabase", () => ({
  getSupabase: getSupabaseMock,
}));

class FakeQuery<T> {
  constructor(private readonly rows: T[]) {}

  select() {
    return this;
  }

  gte() {
    return this;
  }

  lt() {
    return this;
  }

  not() {
    return this;
  }

  range(from: number, to: number) {
    return Promise.resolve({ data: this.rows.slice(from, to + 1), error: null });
  }

  then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return Promise.resolve({ data: this.rows.slice(0, 1000), error: null }).then(
      onfulfilled,
      onrejected
    );
  }
}

describe("getPartnerRevenueInRange", () => {
  beforeEach(() => {
    getSupabaseMock.mockReset();
  });

  it("sums all billable bookings beyond the default 1000-row page", async () => {
    const rows = Array.from({ length: 1001 }, () => ({
      provider_id: "tsiakkas",
      provider_name: "Tsiakkas Winery",
      lead_fee_eur: 5,
    }));
    getSupabaseMock.mockReturnValue({
      from: () => new FakeQuery(rows),
    });

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
