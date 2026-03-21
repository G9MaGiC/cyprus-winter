import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };
let supabaseEnabled = true;

vi.mock("./supabase", () => ({
  getSupabase: () => (supabaseEnabled ? mockSupabase : null),
  hasSupabase: () => supabaseEnabled,
}));

import { createTrailReport, getLatestReportsByTrail, hasTrailReports } from "./trail-reports";

describe("createTrailReport", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    supabaseEnabled = true;
  });

  it("creates a report with generated id and returns it", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue(chain);

    const result = await createTrailReport({
      trailId: "artemis",
      status: "open",
      surface: "dry",
      note: "Clear path",
      temperatureC: 12,
      windKmh: 15,
      reporterEmail: "hiker@example.com",
    });

    expect(result.id).toMatch(/^tr-/);
    expect(result.trailId).toBe("artemis");
    expect(result.status).toBe("open");
    expect(result.surface).toBe("dry");
    expect(result.note).toBe("Clear path");
    expect(result.temperatureC).toBe(12);
    expect(result.windKmh).toBe(15);
    expect(result.reporterEmail).toBe("hiker@example.com");
    expect(result.reportedAt).toBeDefined();
    expect(result.createdAt).toBe(result.reportedAt);
  });

  it("throws when supabase insert fails", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.insert = vi.fn().mockResolvedValue({ error: { message: "constraint violation" } });
    mockFrom.mockReturnValue(chain);

    await expect(
      createTrailReport({ trailId: "t1", status: "open", surface: "dry" })
    ).rejects.toThrow("constraint violation");
  });

  it("still returns report when supabase is not configured", async () => {
    supabaseEnabled = false;
    const result = await createTrailReport({
      trailId: "t1",
      status: "caution",
      surface: "muddy",
    });
    expect(result.trailId).toBe("t1");
    expect(result.status).toBe("caution");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("sets optional fields to undefined when not provided", async () => {
    supabaseEnabled = false;
    const result = await createTrailReport({
      trailId: "t1",
      status: "closed",
      surface: "icy",
    });
    expect(result.note).toBeUndefined();
    expect(result.temperatureC).toBeUndefined();
    expect(result.windKmh).toBeUndefined();
    expect(result.reporterEmail).toBeUndefined();
  });
});

describe("getLatestReportsByTrail", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    supabaseEnabled = true;
  });

  it("returns mapped reports from supabase", async () => {
    const dbRows = [
      {
        id: "tr-1",
        trail_id: "artemis",
        status: "open",
        surface: "dry",
        note: "All good",
        temperature_c: 10,
        wind_kmh: 5,
        reported_at: "2026-03-20T08:00:00Z",
        reporter_email: "h@e.com",
        created_at: "2026-03-20T08:00:00Z",
      },
    ];
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue({ data: dbRows, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await getLatestReportsByTrail("artemis", 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "tr-1",
      trailId: "artemis",
      status: "open",
      surface: "dry",
      note: "All good",
      temperatureC: 10,
      windKmh: 5,
      reportedAt: "2026-03-20T08:00:00Z",
      reporterEmail: "h@e.com",
      createdAt: "2026-03-20T08:00:00Z",
    });
  });

  it("returns empty array when supabase is not configured", async () => {
    supabaseEnabled = false;
    const result = await getLatestReportsByTrail("artemis");
    expect(result).toEqual([]);
  });

  it("returns empty array on query error", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue({ data: null, error: { message: "err" } });
    mockFrom.mockReturnValue(chain);

    const result = await getLatestReportsByTrail("artemis");
    expect(result).toEqual([]);
  });

  it("handles rows with null optional fields", async () => {
    const dbRows = [
      {
        id: "tr-2",
        trail_id: "caledonia-falls",
        status: "caution",
        surface: "muddy",
        note: null,
        temperature_c: null,
        wind_kmh: null,
        reported_at: "2026-03-19T10:00:00Z",
        reporter_email: null,
        created_at: "2026-03-19T10:00:00Z",
      },
    ];
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue({ data: dbRows, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await getLatestReportsByTrail("caledonia-falls");
    expect(result[0].note).toBeUndefined();
    expect(result[0].temperatureC).toBeUndefined();
    expect(result[0].windKmh).toBeUndefined();
    expect(result[0].reporterEmail).toBeUndefined();
  });
});

describe("hasTrailReports", () => {
  it("delegates to hasSupabase", () => {
    supabaseEnabled = true;
    expect(hasTrailReports()).toBe(true);
    supabaseEnabled = false;
    expect(hasTrailReports()).toBe(false);
  });
});
