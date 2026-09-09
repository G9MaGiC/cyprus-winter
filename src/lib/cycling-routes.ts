import { cyclingRoutes } from "@/data/cycling-routes";
import type { CyclingRoute, CyclingRouteRegion } from "@/lib/cycling-route-types";

export type { CyclingRoute, CyclingRouteRegion } from "@/lib/cycling-route-types";
export {
  CYCLING_ROUTE_REGIONS,
  formatRouteDistance,
  VC_CYCLING_INDEX_URL,
  VC_CYCLING_NATURE_URL,
} from "@/lib/cycling-route-types";

export function cyclingRouteCount(): number {
  return cyclingRoutes.length;
}

export function winterPickRoutes(): CyclingRoute[] {
  return cyclingRoutes.filter((r) => r.winterPick);
}

export function filterCyclingRoutes(options: {
  region?: CyclingRouteRegion | null;
  bikeType?: string | null;
}): CyclingRoute[] {
  return cyclingRoutes.filter((r) => {
    if (options.region && r.region !== options.region) return false;
    if (options.bikeType && options.bikeType !== "any" && r.bikeType !== options.bikeType && r.bikeType !== "any") {
      return false;
    }
    return true;
  });
}
