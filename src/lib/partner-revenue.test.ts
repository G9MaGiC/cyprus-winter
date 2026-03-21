import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockNot = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import { getPartnerRevenueThisMonth } from "./partner-revenue";
import { getSupabase } from "./supabase";

const mockGetSupabase = vi.mocked(getSupabase);

describe("getPartnerRevenueThisMonth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ gte: mockGte });
    mockGte.mockReturnValue({ not: mockNot });
  });

  it("returns zero revenue when supabase is null", async () => {
    mockGetSupabase.mockReturnValue(null as any);
    const result = await getPartnerRevenueThisMonth();
    expect(result).toEqual({ totalRevenueEur: 0, byPartner: [] });
  });

  it("queries bookings table with correct filters", async () => {
    mockNot.mockResolvedValue({ data: [], error: null });

    await getPartnerRevenueThisMonth();

    expect(mockFrom).toHaveBeenCalledWith("bookings");
    expect(mockSelect).toHaveBeenCalledWith("provider_id, provider_name, lead_fee_eur");
    expect(mockGte).toHaveBeenCalledWith("created_at", expect.any(String));
    expect(mockNot).toHaveBeenCalledWith("lead_fee_eur", "is", null);
  });

  it("aggregates revenue by partner correctly", async () => {
    mockNot.mockResolvedValue({
      data: [
        { provider_id: "p1", provider_name: "Winery A", lead_fee_eur: 10 },
        { provider_id: "p1", provider_name: "Winery A", lead_fee_eur: 15 },
        { provider_id: "p2", provider_name: "Winery B", lead_fee_eur: 20 },
      ],
      error: null,
    });

    const result = await getPartnerRevenueThisMonth();
    expect(result.totalRevenueEur).toBe(45);
    expect(result.byPartner).toHaveLength(2);

    const p1 = result.byPartner.find((p) => p.providerId === "p1");
    expect(p1).toEqual({
      providerId: "p1",
      providerName: "Winery A",
      bookingCount: 2,
      totalFeeEur: 25,
    });

    const p2 = result.byPartner.find((p) => p.providerId === "p2");
    expect(p2).toEqual({
      providerId: "p2",
      providerName: "Winery B",
      bookingCount: 1,
      totalFeeEur: 20,
    });
  });

  it("returns zero revenue on query error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockNot.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const result = await getPartnerRevenueThisMonth();
    expect(result).toEqual({ totalRevenueEur: 0, byPartner: [] });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("skips rows with zero or negative fees", async () => {
    mockNot.mockResolvedValue({
      data: [
        { provider_id: "p1", provider_name: "Winery A", lead_fee_eur: 0 },
        { provider_id: "p2", provider_name: "Winery B", lead_fee_eur: -5 },
        { provider_id: "p3", provider_name: "Winery C", lead_fee_eur: 10 },
      ],
      error: null,
    });

    const result = await getPartnerRevenueThisMonth();
    expect(result.totalRevenueEur).toBe(10);
    expect(result.byPartner).toHaveLength(1);
    expect(result.byPartner[0].providerId).toBe("p3");
  });

  it("handles NaN lead_fee_eur gracefully", async () => {
    mockNot.mockResolvedValue({
      data: [
        { provider_id: "p1", provider_name: "X", lead_fee_eur: "not-a-number" },
        { provider_id: "p2", provider_name: "Y", lead_fee_eur: 5 },
      ],
      error: null,
    });

    const result = await getPartnerRevenueThisMonth();
    // "not-a-number" -> Number("not-a-number") = NaN -> || 0 -> 0, skipped
    expect(result.totalRevenueEur).toBe(5);
    expect(result.byPartner).toHaveLength(1);
  });

  it("handles null data gracefully", async () => {
    mockNot.mockResolvedValue({ data: null, error: null });
    const result = await getPartnerRevenueThisMonth();
    expect(result).toEqual({ totalRevenueEur: 0, byPartner: [] });
  });
});
