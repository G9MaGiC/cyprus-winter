import { describe, expect, it } from "vitest";
import { cyclingRoutes } from "@/data/cycling-routes";
import {
  CYCLING_ROUTE_REGIONS,
  filterCyclingRoutes,
  formatRouteDistance,
  winterPickRoutes,
} from "@/lib/cycling-routes";

describe("cycling-routes", () => {
  it("loads curated Visit Cyprus routes", () => {
    expect(cyclingRoutes.length).toBeGreaterThanOrEqual(15);
    expect(cyclingRoutes.length).toBeLessThanOrEqual(25);
  });

  it("has unique ids and valid VC URLs", () => {
    const ids = new Set<string>();
    for (const route of cyclingRoutes) {
      expect(ids.has(route.id)).toBe(false);
      ids.add(route.id);
      expect(route.visitCyprusUrl).toMatch(/^https:\/\/www\.visitcyprus\.com\//);
      expect(CYCLING_ROUTE_REGIONS).toContain(route.region);
    }
  });

  it("filters by region", () => {
    const pafos = filterCyclingRoutes({ region: "pafos" });
    expect(pafos.length).toBeGreaterThan(0);
    expect(pafos.every((r) => r.region === "pafos")).toBe(true);
  });

  it("returns winter picks", () => {
    expect(winterPickRoutes().length).toBeGreaterThanOrEqual(8);
  });

  it("formats distances", () => {
    expect(formatRouteDistance(16)).toBe("16 km");
    expect(formatRouteDistance(131.2)).toBe("131.2 km");
    expect(formatRouteDistance(null)).toBeNull();
  });
});
