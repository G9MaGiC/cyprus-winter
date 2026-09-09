import { describe, expect, it } from "vitest";
import { allDiscoverItems } from "@/data/discover";
import {
  ACTIVITY_FILTER_KEYS,
  ACTIVITY_PLACE_IDS,
  buildActivitySection,
  countActivityOptions,
} from "@/lib/activity-catalog";

describe("activity-catalog", () => {
  it("resolves every curated place ID in discover data", () => {
    const ids = new Set(allDiscoverItems.map((item) => item.id));
    for (const key of ACTIVITY_FILTER_KEYS) {
      for (const placeId of ACTIVITY_PLACE_IDS[key]) {
        expect(ids.has(placeId), `${key}: missing place ${placeId}`).toBe(true);
      }
    }
  });

  it("builds a section with at least 3 places per activity", () => {
    for (const key of ACTIVITY_FILTER_KEYS) {
      const section = buildActivitySection(key, allDiscoverItems);
      expect(section, `${key} section`).not.toBeNull();
      expect(section!.items.length, `${key} place count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("has at least 3 total options (places + trails) per activity", () => {
    for (const key of ACTIVITY_FILTER_KEYS) {
      expect(countActivityOptions(key), `${key} total options`).toBeGreaterThanOrEqual(3);
    }
  });

  it("trailLinks carry nameEl so chip renderers can localize (b82)", () => {
    const climbing = buildActivitySection("climbing", allDiscoverItems);
    const capeGreco = climbing?.trailLinks?.find((t) => t.id === "cape-greco");
    expect(capeGreco?.nameEl).toBe("Ακρωτήρι Γκρέκο");
    // A trail without a native name stays EN via getLocalizedName's fallback.
    const pentadaktylos = climbing?.trailLinks?.find((t) => t.id === "pentadaktylos");
    expect(pentadaktylos?.name.length).toBeGreaterThan(0);
    expect(pentadaktylos?.nameEl).toBeUndefined();
  });
});
