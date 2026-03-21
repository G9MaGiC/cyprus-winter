import { describe, it, expect, vi } from "vitest";

vi.mock("@/data", () => ({
  getAttractionById: vi.fn(),
}));

vi.mock("@/data/events", () => ({
  winterEvents: [
    { id: "evt-1", latitude: 34.7, longitude: 33.0 },
    { id: "evt-2" }, // no coords
  ],
}));

vi.mock("@/data/region-centroids", () => ({
  getRegionCentroid: vi.fn((region: string) => {
    if (region === "Troodos") return { lat: 34.95, lng: 32.87 };
    if (region === "Limassol") return { lat: 34.68, lng: 33.04 };
    return null;
  }),
}));

vi.mock("@/data/restaurants", () => ({
  restaurants: [
    { id: "rest-1", latitude: 34.73, longitude: 33.35 },
    { id: "rest-2" }, // no coords
  ],
}));

vi.mock("@/data/trails", () => ({
  trails: [
    { id: "artemis", trailheadCoords: { lat: 34.93, lng: 32.87 } },
    { id: "cape-greco" }, // no trailheadCoords
  ],
}));

vi.mock("@/data/wineries", () => ({
  wineries: [
    { id: "winery-1", latitude: 34.89, longitude: 32.97 },
    { id: "winery-2" }, // no coords
  ],
}));

import { getPlaceCoords } from "./place-coords";
import { getAttractionById } from "@/data";

const mockGetAttractionById = vi.mocked(getAttractionById);

describe("getPlaceCoords", () => {
  describe("attraction type", () => {
    it("returns attraction coords when available", () => {
      mockGetAttractionById.mockReturnValue({
        id: "lefkara",
        latitude: 34.87,
        longitude: 33.31,
      } as any);

      const result = getPlaceCoords({ id: "lefkara", name: "Lefkara", region: "Larnaca", type: "attraction" });
      expect(result).toEqual({ lat: 34.87, lng: 33.31 });
    });

    it("falls back to region centroid when attraction has no coords", () => {
      mockGetAttractionById.mockReturnValue({ id: "x" } as any);

      const result = getPlaceCoords({ id: "x", name: "X", region: "Troodos", type: "attraction" });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });

    it("falls back to region centroid when attraction not found", () => {
      mockGetAttractionById.mockReturnValue(undefined);

      const result = getPlaceCoords({ id: "unknown", name: "Unknown", region: "Limassol", type: "attraction" });
      expect(result).toEqual({ lat: 34.68, lng: 33.04 });
    });
  });

  describe("trail type", () => {
    it("returns trailhead coords when available", () => {
      const result = getPlaceCoords({ id: "artemis", name: "Artemis", region: "Troodos", type: "trail" });
      expect(result).toEqual({ lat: 34.93, lng: 32.87 });
    });

    it("falls back to region centroid when no trailhead coords", () => {
      const result = getPlaceCoords({ id: "cape-greco", name: "Cape Greco", region: "Troodos", type: "trail" });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });

    it("falls back to region centroid for unknown trail", () => {
      const result = getPlaceCoords({ id: "unknown-trail", name: "Unknown", region: "Limassol", type: "trail" });
      expect(result).toEqual({ lat: 34.68, lng: 33.04 });
    });
  });

  describe("winery type", () => {
    it("returns winery coords when available", () => {
      const result = getPlaceCoords({ id: "winery-1", name: "Winery", region: "Troodos", type: "winery" });
      expect(result).toEqual({ lat: 34.89, lng: 32.97 });
    });

    it("falls back to region centroid when no winery coords", () => {
      const result = getPlaceCoords({ id: "winery-2", name: "Winery", region: "Troodos", type: "winery" });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });
  });

  describe("restaurant type", () => {
    it("returns restaurant coords when available", () => {
      const result = getPlaceCoords({ id: "rest-1", name: "Restaurant", region: "Limassol", type: "restaurant" });
      expect(result).toEqual({ lat: 34.73, lng: 33.35 });
    });

    it("falls back to region centroid when no restaurant coords", () => {
      const result = getPlaceCoords({ id: "rest-2", name: "Restaurant", region: "Troodos", type: "restaurant" });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });
  });

  describe("event type", () => {
    it("returns event coords when available", () => {
      const result = getPlaceCoords({ id: "evt-1", name: "Event", region: "Limassol", type: "event" });
      expect(result).toEqual({ lat: 34.7, lng: 33.0 });
    });

    it("falls back to region centroid when no event coords", () => {
      const result = getPlaceCoords({ id: "evt-2", name: "Event", region: "Troodos", type: "event" });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });
  });

  describe("unknown type", () => {
    it("falls back to region centroid for unknown place types", () => {
      const result = getPlaceCoords({ id: "x", name: "X", region: "Troodos", type: "other" as any });
      expect(result).toEqual({ lat: 34.95, lng: 32.87 });
    });

    it("returns null when region centroid is not found", () => {
      const result = getPlaceCoords({ id: "x", name: "X", region: "Unknown Region", type: "other" as any });
      expect(result).toBeNull();
    });
  });
});
