import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };
let supabaseEnabled = true;

vi.mock("./supabase", () => ({
  getSupabase: () => (supabaseEnabled ? mockSupabase : null),
  hasSupabase: () => supabaseEnabled,
}));

import {
  createBooking,
  getBookingsByEmail,
  getBookingsCountThisMonth,
  useDb,
} from "./bookings";
import type { CreateBookingInput } from "./bookings";

const baseInput: CreateBookingInput = {
  type: "winery_tasting",
  providerId: "w-1",
  providerName: "Vouni Panayia",
  date: "2026-03-25",
  partySize: 4,
  guestEmail: "  Guest@Example.com  ",
  guestName: "John Doe",
};

describe("createBooking", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    supabaseEnabled = true;
  });

  it("creates a booking via supabase with normalized email", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue(chain);

    const result = await createBooking(baseInput);

    expect(result.id).toMatch(/^b-/);
    expect(result.status).toBe("pending");
    expect(result.guestName).toBe("John Doe");
    expect(result.providerName).toBe("Vouni Panayia");

    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall.guest_email).toBe("guest@example.com");
  });

  it("throws on supabase insert error", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.insert = vi.fn().mockResolvedValue({ error: { message: "duplicate" } });
    mockFrom.mockReturnValue(chain);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(createBooking(baseInput)).rejects.toThrow("duplicate");
    consoleSpy.mockRestore();
  });

  it("passes leadFeeEur to supabase insert", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue(chain);

    await createBooking({ ...baseInput, leadFeeEur: 5.0 });
    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall.lead_fee_eur).toBe(5.0);
  });

  it("falls back to in-memory store when supabase is not configured", async () => {
    supabaseEnabled = false;
    const result = await createBooking(baseInput);
    expect(result.id).toMatch(/^b-/);
    expect(result.status).toBe("pending");
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("getBookingsByEmail", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    supabaseEnabled = true;
  });

  it("queries supabase with normalized email", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "b-1",
          type: "winery_tasting",
          provider_id: "w-1",
          provider_name: "Vouni Panayia",
          date: "2026-03-25",
          party_size: 4,
          guest_email: "guest@example.com",
          guest_name: "John",
          status: "pending",
          created_at: "2026-03-20T10:00:00Z",
          notes: null,
        },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const result = await getBookingsByEmail("  Guest@Example.com  ");
    expect(chain.eq).toHaveBeenCalledWith("guest_email", "guest@example.com");
    expect(result).toHaveLength(1);
    expect(result[0].guestEmail).toBe("guest@example.com");
  });

  it("throws on supabase error", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } });
    mockFrom.mockReturnValue(chain);

    await expect(getBookingsByEmail("a@b.com")).rejects.toThrow("db down");
  });

  it("maps guide_tour type correctly", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({
      data: [
        {
          id: "b-2",
          type: "guide_tour",
          provider_id: "g-1",
          provider_name: "Nikos",
          date: "2026-03-26",
          party_size: 2,
          guest_email: "a@b.com",
          guest_name: "Jane",
          status: "confirmed",
          created_at: "2026-03-20T11:00:00Z",
          notes: "Morning hike",
        },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const result = await getBookingsByEmail("a@b.com");
    expect(result[0].type).toBe("guide_tour");
    expect(result[0].notes).toBe("Morning hike");
  });
});

describe("getBookingsCountThisMonth", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    supabaseEnabled = true;
  });

  it("returns count from supabase", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.gte = vi.fn().mockResolvedValue({ count: 42, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await getBookingsCountThisMonth();
    expect(result).toBe(42);
  });

  it("returns 0 on supabase error", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.gte = vi.fn().mockResolvedValue({ count: null, error: { message: "err" } });
    mockFrom.mockReturnValue(chain);

    const result = await getBookingsCountThisMonth();
    expect(result).toBe(0);
  });
});

describe("useDb", () => {
  it("delegates to hasSupabase", () => {
    supabaseEnabled = true;
    expect(useDb()).toBe(true);
    supabaseEnabled = false;
    expect(useDb()).toBe(false);
  });
});
