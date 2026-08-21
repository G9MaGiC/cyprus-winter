import { describe, expect, it, vi } from "vitest";
import { assignDiscoveryBadges, type ScoredPlace } from "./right-now-scoring";
import { DISCOVERY_BADGE_CODES } from "./right-now-badges";

vi.mock("@/lib/daily-rotator", () => ({
  pickDailyWithKey: vi.fn(() => ({ id: "trending-place" })),
}));

function scoredPlace(overrides: Partial<ScoredPlace> & Pick<ScoredPlace, "id">): ScoredPlace {
  return {
    id: overrides.id,
    name: overrides.name ?? "Test",
    region: overrides.region ?? "Troodos",
    type: overrides.type ?? "attraction",
    score: overrides.score ?? 0.8,
    distanceKm: overrides.distanceKm ?? 10,
    timeOfDayMatch: overrides.timeOfDayMatch ?? "morning",
    preferredBuckets: overrides.preferredBuckets ?? ["morning"],
    coords: overrides.coords ?? { lat: 34.9, lng: 32.9 },
    localSecret: overrides.localSecret,
    effectiveType: overrides.effectiveType,
  };
}

describe("assignDiscoveryBadges", () => {
  it("returns stable i18n keys, not English display strings", () => {
    const items = [
      scoredPlace({ id: "trending-place" }),
      scoredPlace({ id: "near-gem", localSecret: "Quiet tip", distanceKm: 5 }),
      scoredPlace({ id: "far-gem", localSecret: "Quiet tip", distanceKm: 40 }),
      scoredPlace({ id: "plain", distanceKm: 50 }),
    ];

    const withBadges = assignDiscoveryBadges(items, null);

    expect(withBadges[0]?.discoveryBadge).toBe("trending_today");
    expect(withBadges[1]?.discoveryBadge).toBe("hidden_gem_near_you");
    expect(withBadges[2]?.discoveryBadge).toBe("only_locals_know");
    expect(withBadges[3]?.discoveryBadge).toBeNull();

    for (const badge of withBadges.map((item) => item.discoveryBadge).filter(Boolean)) {
      expect(DISCOVERY_BADGE_CODES).toContain(badge);
    }
  });
});
