import { describe, it, expect } from "vitest";
import { getRegionCentroid, getCentroidBySlug, REGION_CENTROIDS } from "./region-centroids";

describe("getRegionCentroid", () => {
  it("returns centroid for direct region match", () => {
    expect(getRegionCentroid("Limassol")).toEqual({ lat: 34.68, lng: 33.04 });
    expect(getRegionCentroid("Troodos")).toEqual({ lat: 34.93, lng: 32.87 });
    expect(getRegionCentroid("Platres")).toEqual({ lat: 34.88, lng: 32.87 });
  });

  it("prefers specific location over district for Village (District) format", () => {
    const platres = REGION_CENTROIDS.Platres;
    expect(getRegionCentroid("Platres (Limassol)")).toEqual(platres);
    expect(getRegionCentroid("Omodos (Limassol)")).toEqual(REGION_CENTROIDS.Omodos);
    expect(getRegionCentroid("Kathikas (Paphos)")).toEqual(REGION_CENTROIDS.Kathikas);
  });

  it("uses district when specific location has no centroid", () => {
    expect(getRegionCentroid("SomeUnknownVillage (Limassol)")).toEqual(REGION_CENTROIDS.Limassol);
  });

  it("returns centroid for All (island-wide events)", () => {
    expect(getRegionCentroid("All")).toEqual(REGION_CENTROIDS.All);
  });

  it("returns null for unknown region", () => {
    expect(getRegionCentroid("Unknown Region Xyz")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(getRegionCentroid("  Platres  ")).toEqual(REGION_CENTROIDS.Platres);
  });
});

describe("getCentroidBySlug", () => {
  it("returns centroid for valid region slug", () => {
    expect(getCentroidBySlug("troodos")).toEqual(REGION_CENTROIDS.Troodos);
    expect(getCentroidBySlug("limassol")).toEqual(REGION_CENTROIDS.Limassol);
    expect(getCentroidBySlug("ayia-napa")).toEqual(REGION_CENTROIDS["Ayia Napa"]);
  });
});
