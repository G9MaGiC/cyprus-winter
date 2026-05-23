import { describe, expect, it } from "vitest";
import { activityPlaces } from "@/data/activity-places";
import { allDiscoverIds } from "@/data/discover";
import { allPlaces } from "@/data";
import { trails } from "@/data/trails";
import { ACTIVITY_PLACE_IDS } from "@/lib/activity-catalog";

const CYPRUS_LAT = { min: 34.5, max: 35.75 };
const CYPRUS_LNG = { min: 32.2, max: 34.65 };

const validCombineIds = new Set([
  ...allDiscoverIds,
  ...allPlaces.map((p) => p.id),
  ...trails.map((t) => t.id),
]);

describe("activity-places data quality", () => {
  it("has coordinates within Cyprus bounds when present", () => {
    for (const place of activityPlaces) {
      if (place.latitude == null || place.longitude == null) continue;
      expect(
        place.latitude,
        `${place.id} latitude`
      ).toBeGreaterThanOrEqual(CYPRUS_LAT.min);
      expect(place.latitude, `${place.id} latitude`).toBeLessThanOrEqual(
        CYPRUS_LAT.max
      );
      expect(
        place.longitude,
        `${place.id} longitude`
      ).toBeGreaterThanOrEqual(CYPRUS_LNG.min);
      expect(place.longitude, `${place.id} longitude`).toBeLessThanOrEqual(
        CYPRUS_LNG.max
      );
    }
  });

  it("resolves all combineWith IDs", () => {
    for (const place of activityPlaces) {
      for (const id of place.combineWith ?? []) {
        expect(
          validCombineIds.has(id),
          `${place.id} combineWith → ${id}`
        ).toBe(true);
      }
    }
  });

  it("catalog activity place IDs exist in discover data", () => {
    const ids = new Set(allDiscoverIds);
    for (const key of Object.keys(ACTIVITY_PLACE_IDS) as Array<
      keyof typeof ACTIVITY_PLACE_IDS
    >) {
      for (const placeId of ACTIVITY_PLACE_IDS[key]) {
        expect(ids.has(placeId), `${key}: ${placeId}`).toBe(true);
      }
    }
  });
});

describe("activity-places factual anchors", () => {
  it("places Gerakopetra in Paphos (Laona), not Limassol", () => {
    const g = activityPlaces.find((p) => p.id === "gerakopetra-boulders");
    expect(g?.region).toBe("Paphos");
    expect(g!.latitude!).toBeGreaterThan(35);
    expect(g!.longitude!).toBeLessThan(33);
  });

  it("places Episkopi crags in Paphos hills", () => {
    const e = activityPlaces.find((p) => p.id === "episkopi-crags");
    expect(e?.region).toBe("Paphos");
  });

  it("does not link Lady's Mile windsurf to Larnaca salt lake trail", () => {
    const l = activityPlaces.find((p) => p.id === "lady-mile-windsurf");
    expect(l?.combineWith).not.toContain("larnaca-salt-lake");
  });
});
