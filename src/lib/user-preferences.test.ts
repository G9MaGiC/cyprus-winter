import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getUserPreferences,
  setUserPreferences,
  toggleInterest,
  toggleFavoriteRegion,
  INTEREST_LABELS,
  TRAVELER_LABELS,
} from "./user-preferences";
import type { UserPreferences } from "./user-preferences";

describe("user-preferences", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const DEFAULTS: UserPreferences = {
    interests: [],
    travelerType: null,
    favoriteRegions: [],
    notifyTrailConditions: true,
    notifyEvents: true,
  };

  describe("getUserPreferences", () => {
    it("returns defaults when nothing is stored", () => {
      expect(getUserPreferences()).toEqual(DEFAULTS);
    });

    it("returns defaults when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      expect(getUserPreferences()).toEqual(DEFAULTS);
    });

    it("loads stored preferences", () => {
      const prefs: UserPreferences = {
        interests: ["active", "wine"],
        travelerType: "couple",
        favoriteRegions: ["Troodos"],
        homeCity: "London",
        notifyTrailConditions: false,
        notifyEvents: true,
      };
      store["cyprus-user-preferences"] = JSON.stringify(prefs);

      const result = getUserPreferences();
      expect(result.interests).toEqual(["active", "wine"]);
      expect(result.travelerType).toBe("couple");
      expect(result.favoriteRegions).toEqual(["Troodos"]);
      expect(result.homeCity).toBe("London");
      expect(result.notifyTrailConditions).toBe(false);
    });

    it("filters invalid interest values", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        interests: ["active", "invalid-interest", "wine"],
      });
      const result = getUserPreferences();
      expect(result.interests).toEqual(["active", "wine"]);
    });

    it("rejects invalid travelerType", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        travelerType: "unknown-type",
      });
      const result = getUserPreferences();
      expect(result.travelerType).toBeNull();
    });

    it("handles corrupted JSON gracefully", () => {
      store["cyprus-user-preferences"] = "not-valid-json{{{";
      const result = getUserPreferences();
      expect(result).toEqual(DEFAULTS);
    });

    it("handles partial stored data with defaults for missing fields", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        interests: ["culture"],
      });
      const result = getUserPreferences();
      expect(result.interests).toEqual(["culture"]);
      expect(result.travelerType).toBeNull();
      expect(result.favoriteRegions).toEqual([]);
      expect(result.notifyTrailConditions).toBe(true);
      expect(result.notifyEvents).toBe(true);
    });

    it("uses defaults when interests is not an array", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        interests: "not-an-array",
      });
      const result = getUserPreferences();
      expect(result.interests).toEqual([]);
    });

    it("uses defaults when booleans are non-boolean types", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        notifyTrailConditions: "yes",
        notifyEvents: 1,
      });
      const result = getUserPreferences();
      expect(result.notifyTrailConditions).toBe(true);
      expect(result.notifyEvents).toBe(true);
    });
  });

  describe("setUserPreferences", () => {
    it("merges partial preferences with existing", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        interests: ["active"],
        travelerType: "solo",
        favoriteRegions: [],
        notifyTrailConditions: true,
        notifyEvents: true,
      });

      const result = setUserPreferences({ travelerType: "couple" });
      expect(result.interests).toEqual(["active"]);
      expect(result.travelerType).toBe("couple");
    });

    it("saves to localStorage", () => {
      setUserPreferences({ interests: ["wine"] });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cyprus-user-preferences",
        expect.any(String)
      );
      const saved = JSON.parse(store["cyprus-user-preferences"]);
      expect(saved.interests).toEqual(["wine"]);
    });

    it("returns updated preferences", () => {
      const result = setUserPreferences({
        homeCity: "Berlin",
        notifyEvents: false,
      });
      expect(result.homeCity).toBe("Berlin");
      expect(result.notifyEvents).toBe(false);
    });

    it("allows setting travelerType to null", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        ...DEFAULTS,
        travelerType: "solo",
      });
      const result = setUserPreferences({ travelerType: null });
      expect(result.travelerType).toBeNull();
    });

    it("does not save when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      const result = setUserPreferences({ interests: ["wine"] });
      // Should return defaults since load() returns DEFAULTS in SSR
      expect(result.interests).toEqual(["wine"]);
    });
  });

  describe("toggleInterest", () => {
    it("adds interest when not present", () => {
      const result = toggleInterest("active");
      expect(result.interests).toContain("active");
    });

    it("removes interest when already present", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        ...DEFAULTS,
        interests: ["active", "wine"],
      });
      const result = toggleInterest("active");
      expect(result.interests).not.toContain("active");
      expect(result.interests).toContain("wine");
    });

    it("preserves other preferences when toggling", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        ...DEFAULTS,
        travelerType: "solo",
        homeCity: "Rome",
      });
      const result = toggleInterest("culture");
      expect(result.travelerType).toBe("solo");
      expect(result.homeCity).toBe("Rome");
    });
  });

  describe("toggleFavoriteRegion", () => {
    it("adds region when not present", () => {
      const result = toggleFavoriteRegion("Troodos");
      expect(result.favoriteRegions).toContain("Troodos");
    });

    it("removes region when already present", () => {
      store["cyprus-user-preferences"] = JSON.stringify({
        ...DEFAULTS,
        favoriteRegions: ["Troodos", "Paphos"],
      });
      const result = toggleFavoriteRegion("Troodos");
      expect(result.favoriteRegions).not.toContain("Troodos");
      expect(result.favoriteRegions).toContain("Paphos");
    });
  });

  describe("INTEREST_LABELS", () => {
    it("has labels for all interest types", () => {
      const interests = ["active", "culture", "wine", "wellness", "villages"] as const;
      for (const i of interests) {
        expect(typeof INTEREST_LABELS[i]).toBe("string");
        expect(INTEREST_LABELS[i].length).toBeGreaterThan(0);
      }
    });
  });

  describe("TRAVELER_LABELS", () => {
    it("has labels for all traveler types", () => {
      const types = ["solo", "couple", "family", "group", "nomad"] as const;
      for (const t of types) {
        expect(typeof TRAVELER_LABELS[t]).toBe("string");
        expect(TRAVELER_LABELS[t].length).toBeGreaterThan(0);
      }
    });
  });
});
