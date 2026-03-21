import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock React
vi.mock("react", () => ({
  useState: vi.fn((init: unknown) => [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()]),
  useEffect: vi.fn(),
  useCallback: vi.fn((fn: unknown) => fn),
}));

const mockGetUserPreferences = vi.fn(() => ({
  interests: [],
  travelerType: null,
  favoriteRegions: [],
  notifyTrailConditions: true,
  notifyEvents: true,
}));

const mockSetUserPreferences = vi.fn((partial: Record<string, unknown>) => ({
  interests: [],
  travelerType: null,
  favoriteRegions: [],
  notifyTrailConditions: true,
  notifyEvents: true,
  ...partial,
}));

const mockToggleInterest = vi.fn((interest: string) => ({
  interests: [interest],
  travelerType: null,
  favoriteRegions: [],
  notifyTrailConditions: true,
  notifyEvents: true,
}));

const mockToggleFavoriteRegion = vi.fn((region: string) => ({
  interests: [],
  travelerType: null,
  favoriteRegions: [region],
  notifyTrailConditions: true,
  notifyEvents: true,
}));

vi.mock("@/lib/user-preferences", () => ({
  getUserPreferences: mockGetUserPreferences,
  setUserPreferences: mockSetUserPreferences,
  toggleInterest: mockToggleInterest,
  toggleFavoriteRegion: mockToggleFavoriteRegion,
}));

describe("useUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can be imported without error", async () => {
    const mod = await import("@/hooks/useUserPreferences");
    expect(typeof mod.useUserPreferences).toBe("function");
  });

  it("returns expected shape", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    expect(result).toHaveProperty("prefs");
    expect(result).toHaveProperty("update");
    expect(result).toHaveProperty("toggleInterest");
    expect(result).toHaveProperty("toggleFavoriteRegion");
    expect(result).toHaveProperty("hydrated");
  });

  it("initial prefs have correct defaults", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    expect(result.prefs).toEqual({
      interests: [],
      travelerType: null,
      favoriteRegions: [],
      notifyTrailConditions: true,
      notifyEvents: true,
    });
  });

  it("update calls setUserPreferences from lib", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    const partial = { interests: ["active" as const] };
    result.update(partial);

    expect(mockSetUserPreferences).toHaveBeenCalledWith(partial);
  });

  it("update returns updated preferences", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    const updated = result.update({ travelerType: "solo" });
    expect(updated).toHaveProperty("travelerType", "solo");
  });

  it("toggleInterest calls doToggleInterest from lib", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    result.toggleInterest("wine");
    expect(mockToggleInterest).toHaveBeenCalledWith("wine");
  });

  it("toggleInterest returns updated preferences", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    const updated = result.toggleInterest("culture");
    expect(updated.interests).toContain("culture");
  });

  it("toggleFavoriteRegion calls doToggleFavoriteRegion from lib", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    result.toggleFavoriteRegion("Troodos");
    expect(mockToggleFavoriteRegion).toHaveBeenCalledWith("Troodos");
  });

  it("toggleFavoriteRegion returns updated preferences", async () => {
    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    const result = useUserPreferences();

    const updated = result.toggleFavoriteRegion("Paphos");
    expect(updated.favoriteRegions).toContain("Paphos");
  });

  it("registers a useEffect for hydration", async () => {
    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockClear();

    const { useUserPreferences } = await import("@/hooks/useUserPreferences");
    useUserPreferences();

    expect(useEffectMock).toHaveBeenCalled();
  });
});
