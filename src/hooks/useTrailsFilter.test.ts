import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to capture what useMemo receives to test the filter logic
let lastMemoFn: (() => unknown) | null = null;

vi.mock("react", () => ({
  useMemo: vi.fn((fn: () => unknown) => {
    lastMemoFn = fn;
    return fn();
  }),
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => mockSearchParams),
}));

// We do NOT mock the data modules — they provide real trail data for realistic filter testing
// But we need to handle if they fail to import, so let's verify they exist first

describe("useTrailsFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    lastMemoFn = null;
  });

  it("can be imported without error", async () => {
    const mod = await import("@/hooks/useTrailsFilter");
    expect(typeof mod.useTrailsFilter).toBe("function");
  });

  it("returns expected shape", async () => {
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    expect(result).toHaveProperty("filtered");
    expect(result).toHaveProperty("openTrails");
    expect(result).toHaveProperty("cautionTrails");
    expect(result).toHaveProperty("closedTrails");
    expect(result).toHaveProperty("unknownTrails");
    expect(result).toHaveProperty("bestNow");
    expect(result).toHaveProperty("counts");
    expect(result).toHaveProperty("safeDifficulty");
    expect(result).toHaveProperty("safeRegion");
    expect(result).toHaveProperty("safeStatus");
    expect(result).toHaveProperty("hasFilters");
    expect(result).toHaveProperty("hasInvalidFilter");
  });

  it("returns arrays for all trail lists", async () => {
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    expect(Array.isArray(result.filtered)).toBe(true);
    expect(Array.isArray(result.openTrails)).toBe(true);
    expect(Array.isArray(result.cautionTrails)).toBe(true);
    expect(Array.isArray(result.closedTrails)).toBe(true);
    expect(Array.isArray(result.unknownTrails)).toBe(true);
    expect(Array.isArray(result.bestNow)).toBe(true);
  });

  it("counts object has open, caution, closed", async () => {
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    expect(result.counts).toHaveProperty("open");
    expect(result.counts).toHaveProperty("caution");
    expect(result.counts).toHaveProperty("closed");
    expect(typeof result.counts.open).toBe("number");
    expect(typeof result.counts.caution).toBe("number");
    expect(typeof result.counts.closed).toBe("number");
  });

  it("hasFilters is false when no search params", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.hasFilters).toBe(false);
  });

  it("hasInvalidFilter is false when no search params", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.hasInvalidFilter).toBe(false);
  });

  it("safeDifficulty is undefined when no filter", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBeUndefined();
  });

  it("safeRegion is undefined when no filter", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeRegion).toBeUndefined();
  });

  it("safeStatus is undefined when no filter", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeStatus).toBeUndefined();
  });
});

describe("useTrailsFilter with difficulty filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets safeDifficulty for valid difficulty", async () => {
    mockSearchParams = new URLSearchParams("difficulty=easy");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("easy");
    expect(result.hasFilters).toBe(true);
  });

  it("filters trails by difficulty=moderate", async () => {
    mockSearchParams = new URLSearchParams("difficulty=moderate");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("moderate");
    for (const trail of result.filtered) {
      expect(trail.difficulty).toBe("moderate");
    }
  });

  it("marks invalid difficulty as hasInvalidFilter", async () => {
    mockSearchParams = new URLSearchParams("difficulty=extreme");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBeUndefined();
    expect(result.hasInvalidFilter).toBe(true);
  });

  it("handles difficulty=hard", async () => {
    mockSearchParams = new URLSearchParams("difficulty=hard");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("hard");
    for (const trail of result.filtered) {
      expect(trail.difficulty).toBe("hard");
    }
  });

  it("handles difficulty=expert", async () => {
    mockSearchParams = new URLSearchParams("difficulty=expert");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("expert");
  });
});

describe("useTrailsFilter with region filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets safeRegion for valid region", async () => {
    mockSearchParams = new URLSearchParams("region=Troodos");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeRegion).toBe("Troodos");
    expect(result.hasFilters).toBe(true);
  });

  it("filters trails by region", async () => {
    mockSearchParams = new URLSearchParams("region=Troodos");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    for (const trail of result.filtered) {
      expect(trail.region).toBe("Troodos");
    }
  });

  it("marks invalid region as hasInvalidFilter", async () => {
    mockSearchParams = new URLSearchParams("region=Atlantis");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeRegion).toBeUndefined();
    expect(result.hasInvalidFilter).toBe(true);
  });
});

describe("useTrailsFilter with status filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets safeStatus for valid status=open", async () => {
    mockSearchParams = new URLSearchParams("status=open");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeStatus).toBe("open");
    expect(result.hasFilters).toBe(true);
  });

  it("sets safeStatus for status=caution", async () => {
    mockSearchParams = new URLSearchParams("status=caution");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeStatus).toBe("caution");
  });

  it("sets safeStatus for status=closed", async () => {
    mockSearchParams = new URLSearchParams("status=closed");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeStatus).toBe("closed");
  });

  it("marks invalid status as hasInvalidFilter", async () => {
    mockSearchParams = new URLSearchParams("status=unknown-status");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeStatus).toBeUndefined();
    expect(result.hasInvalidFilter).toBe(true);
  });
});

describe("useTrailsFilter with combined filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies both difficulty and region filters", async () => {
    mockSearchParams = new URLSearchParams("difficulty=easy&region=Troodos");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("easy");
    expect(result.safeRegion).toBe("Troodos");
    expect(result.hasFilters).toBe(true);
    for (const trail of result.filtered) {
      expect(trail.difficulty).toBe("easy");
      expect(trail.region).toBe("Troodos");
    }
  });

  it("applies difficulty, region, and status together", async () => {
    mockSearchParams = new URLSearchParams("difficulty=moderate&region=Troodos&status=open");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.safeDifficulty).toBe("moderate");
    expect(result.safeRegion).toBe("Troodos");
    expect(result.safeStatus).toBe("open");
  });

  it("invalid difficulty with valid region marks hasInvalidFilter", async () => {
    mockSearchParams = new URLSearchParams("difficulty=extreme&region=Troodos");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.hasInvalidFilter).toBe(true);
    expect(result.safeDifficulty).toBeUndefined();
    expect(result.safeRegion).toBe("Troodos");
  });
});

describe("useTrailsFilter bestNow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bestNow has at most 5 trails", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    expect(result.bestNow.length).toBeLessThanOrEqual(5);
  });

  it("bestNow contains only open trails", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();
    const { trailConditions } = await import("@/data/trails");
    for (const trail of result.bestNow) {
      expect(trailConditions[trail.id]?.status).toBe("open");
    }
  });
});

describe("useTrailsFilter trail categorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("categorized trails sum up correctly", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    const categorizedCount =
      result.openTrails.length +
      result.cautionTrails.length +
      result.closedTrails.length +
      result.unknownTrails.length;

    expect(categorizedCount).toBe(result.filtered.length);
  });

  it("no trail appears in multiple categories", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    const allIds = [
      ...result.openTrails.map((t) => t.id),
      ...result.cautionTrails.map((t) => t.id),
      ...result.closedTrails.map((t) => t.id),
      ...result.unknownTrails.map((t) => t.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

describe("useTrailsFilter counts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts reflect base filtered trails (before status filter)", async () => {
    mockSearchParams = new URLSearchParams("status=open");
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    // Counts should include all statuses, not just filtered ones
    // open count should be >= openTrails.length
    expect(result.counts.open).toBeGreaterThanOrEqual(result.openTrails.length);
  });

  it("all count values are non-negative", async () => {
    mockSearchParams = new URLSearchParams();
    const { useTrailsFilter } = await import("@/hooks/useTrailsFilter");
    const result = useTrailsFilter();

    expect(result.counts.open).toBeGreaterThanOrEqual(0);
    expect(result.counts.caution).toBeGreaterThanOrEqual(0);
    expect(result.counts.closed).toBeGreaterThanOrEqual(0);
  });
});
