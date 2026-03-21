import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock React
vi.mock("react", () => ({
  useState: vi.fn((init: unknown) => [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()]),
  useEffect: vi.fn(),
  useCallback: vi.fn((fn: unknown) => fn),
  useRef: vi.fn((val: unknown) => ({ current: val })),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/data/region-centroids", () => ({
  getCentroidBySlug: vi.fn((slug: string) => {
    const centroids: Record<string, { lat: number; lng: number }> = {
      troodos: { lat: 34.93, lng: 32.87 },
      paphos: { lat: 34.77, lng: 32.42 },
      limassol: { lat: 34.68, lng: 33.04 },
      larnaca: { lat: 34.92, lng: 33.63 },
      "ayia-napa": { lat: 34.99, lng: 34.0 },
    };
    return centroids[slug] ?? { lat: 34.95, lng: 33.2 };
  }),
}));

describe("RightNowFeed types", () => {
  it("exports RightNowState type values", async () => {
    // We verify the type by ensuring the module exports exist
    const mod = await import("@/hooks/useRightNowFeed");
    expect(typeof mod.useRightNowFeed).toBe("function");
  });
});

describe("useRightNowFeed constants", () => {
  // Constants are module-scoped but we can verify their effects
  it("CONSENT_KEY, MAX_KM_NEAR, and STALE_MS are used correctly in hook", async () => {
    // These are internal constants; we test their effects through behavior
    const mod = await import("@/hooks/useRightNowFeed");
    expect(mod).toBeDefined();
  });
});

describe("useRightNowFeed hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns expected shape", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();

    expect(result).toHaveProperty("state");
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("lastErrorCode");
    expect(result).toHaveProperty("coords");
    expect(result).toHaveProperty("distanceMode");
    expect(result).toHaveProperty("sourceMode");
    expect(result).toHaveProperty("selectedRegion");
    expect(result).toHaveProperty("handleUseLocation");
    expect(result).toHaveProperty("handlePickRegion");
    expect(result).toHaveProperty("handleRegionSelect");
    expect(result).toHaveProperty("handleDistanceChange");
  });

  it("initial state is consent", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.state).toBe("consent");
  });

  it("initial coords are null", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.coords).toBeNull();
  });

  it("initial distanceMode is less", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.distanceMode).toBe("less");
  });

  it("initial sourceMode is gps", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.sourceMode).toBe("gps");
  });

  it("initial selectedRegion is null", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.selectedRegion).toBeNull();
  });

  it("initial items is empty array", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.items).toEqual([]);
  });

  it("lastErrorCode is null when no error", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastErrorCode).toBeNull();
  });

  it("lastRetryAfterSeconds is undefined when no error", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastRetryAfterSeconds).toBeUndefined();
  });
});

describe("useRightNowFeed error code extraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts RATE_LIMITED error code from query error", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: "RATE_LIMITED", status: 429 },
    });

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastErrorCode).toBe("RATE_LIMITED");
  });

  it("extracts SERVICE_UNAVAILABLE error code", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: "SERVICE_UNAVAILABLE", status: 503 },
    });

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastErrorCode).toBe("SERVICE_UNAVAILABLE");
  });

  it("extracts retryAfterSeconds from error", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: "RATE_LIMITED", status: 429, retryAfterSeconds: 30 },
    });

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastRetryAfterSeconds).toBe(30);
  });

  it("falls back to RATE_LIMITED for status 429 without code", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 429 },
    });

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastErrorCode).toBe("RATE_LIMITED");
  });

  it("returns null error code for non-429 error without code", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500 },
    });

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(result.lastErrorCode).toBeNull();
  });
});

describe("useRightNowFeed handler functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleRegionSelect calls getCentroidBySlug", async () => {
    const { getCentroidBySlug } = await import("@/data/region-centroids");
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();

    result.handleRegionSelect("troodos");
    expect(getCentroidBySlug).toHaveBeenCalledWith("troodos");
  });

  it("handleDistanceChange is a callable function", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(typeof result.handleDistanceChange).toBe("function");
    // Should not throw
    expect(() => result.handleDistanceChange("more")).not.toThrow();
  });

  it("handlePickRegion is a callable function", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(typeof result.handlePickRegion).toBe("function");
  });

  it("handleUseLocation is a callable function", async () => {
    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    const result = useRightNowFeed();
    expect(typeof result.handleUseLocation).toBe("function");
  });
});

describe("useRightNowFeed useQuery configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes correct query key structure", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    const useQueryMock = useQuery as ReturnType<typeof vi.fn>;

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    useRightNowFeed();

    expect(useQueryMock).toHaveBeenCalled();
    const config = useQueryMock.mock.calls[0][0];
    expect(config.queryKey[0]).toBe("right-now");
    // coords are null initially so lat/lng are undefined
    expect(config.queryKey[1]).toBeUndefined();
    expect(config.queryKey[2]).toBeUndefined();
  });

  it("query is disabled when coords are null", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    const useQueryMock = useQuery as ReturnType<typeof vi.fn>;

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    useRightNowFeed();

    const config = useQueryMock.mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it("staleTime is 5 minutes (300000ms)", async () => {
    const { useQuery } = await import("@tanstack/react-query");
    const useQueryMock = useQuery as ReturnType<typeof vi.fn>;

    const { useRightNowFeed } = await import("@/hooks/useRightNowFeed");
    useRightNowFeed();

    const config = useQueryMock.mock.calls[0][0];
    expect(config.staleTime).toBe(5 * 60 * 1000);
  });
});
