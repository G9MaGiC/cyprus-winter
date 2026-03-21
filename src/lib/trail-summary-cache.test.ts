import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };
let supabaseEnabled = true;

vi.mock("./supabase", () => ({
  getSupabase: () => (supabaseEnabled ? mockSupabase : null),
}));

const mockGetLatestReportsByTrail = vi.fn();
vi.mock("./trail-reports", () => ({
  getLatestReportsByTrail: (...args: unknown[]) => mockGetLatestReportsByTrail(...args),
}));

// Must reset modules between tests since the module has internal state (memoryCache)
describe("trail-summary-cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:00:00Z"));
    mockFrom.mockReset();
    mockGetLatestReportsByTrail.mockReset();
    supabaseEnabled = true;
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getTrailSummary", () => {
    it("fetches from supabase cache table", async () => {
      const cachedValue = { artemis: { status: "open", surface: "dry" } };
      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({ data: { value: cachedValue }, error: null });
      mockFrom.mockReturnValue(chain);

      const mod = await import("./trail-summary-cache");
      const result = await mod.getTrailSummary();
      expect(result).toEqual(cachedValue);
    });

    it("returns null when supabase not configured and no memory cache", async () => {
      supabaseEnabled = false;
      const mod = await import("./trail-summary-cache");
      const result = await mod.getTrailSummary();
      expect(result).toBeNull();
    });

    it("returns memory cache on subsequent calls within TTL", async () => {
      const cachedValue = { artemis: { status: "open", surface: "dry" } };
      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.single = vi.fn().mockResolvedValue({ data: { value: cachedValue }, error: null });
      mockFrom.mockReturnValue(chain);

      const mod = await import("./trail-summary-cache");
      await mod.getTrailSummary();

      // Second call should use memory cache
      mockFrom.mockReset();
      const result = await mod.getTrailSummary();
      expect(result).toEqual(cachedValue);
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("refreshTrailSummary", () => {
    it("fetches latest reports for featured trails and caches them", async () => {
      mockGetLatestReportsByTrail.mockImplementation((trailId: string) => {
        if (trailId === "artemis") {
          return Promise.resolve([
            { status: "open", surface: "dry", reportedAt: "2026-03-20T10:00:00Z" },
          ]);
        }
        return Promise.resolve([]);
      });

      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.upsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue(chain);

      const mod = await import("./trail-summary-cache");
      const result = await mod.refreshTrailSummary();

      expect(result).toHaveProperty("artemis");
      expect(result.artemis).toEqual({
        status: "open",
        surface: "dry",
        reportedAt: "2026-03-20T10:00:00Z",
      });
      expect(mockGetLatestReportsByTrail).toHaveBeenCalledTimes(4); // 4 featured trails
    });

    it("upserts to supabase cache table", async () => {
      mockGetLatestReportsByTrail.mockResolvedValue([]);
      const chain: Record<string, ReturnType<typeof vi.fn>> = {};
      chain.upsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue(chain);

      const mod = await import("./trail-summary-cache");
      await mod.refreshTrailSummary();

      expect(mockFrom).toHaveBeenCalledWith("cache");
      expect(chain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ key: "trail_summary" }),
        { onConflict: "key" }
      );
    });

    it("skips supabase upsert when not configured", async () => {
      supabaseEnabled = false;
      mockGetLatestReportsByTrail.mockResolvedValue([]);

      const mod = await import("./trail-summary-cache");
      const result = await mod.refreshTrailSummary();

      expect(result).toEqual({});
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });
});
