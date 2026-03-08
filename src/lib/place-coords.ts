import type { PlanItem } from "@/data";
import { getAttractionById } from "@/data";
import { getRegionCentroid } from "@/data/region-centroids";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import type { Winery } from "@/data/wineries";
import type { Trail } from "@/data/trails";

export type Coords = { lat: number; lng: number };

/**
 * Resolve coordinates for a place. Used for distance calculations in Right Now feed.
 * - Trails: trailheadCoords
 * - Wineries: latitude/longitude or region centroid
 * - Restaurants: latitude/longitude or region centroid
 * - Attractions: latitude/longitude or region centroid
 * - Events: region centroid
 */
export function getPlaceCoords(place: PlanItem): Coords | null {
  if (place.type === "attraction") {
    const attraction = getAttractionById(place.id);
    if (attraction && typeof attraction.latitude === "number" && typeof attraction.longitude === "number") {
      return { lat: attraction.latitude, lng: attraction.longitude };
    }
    return getRegionCentroid(place.region);
  }

  if (place.type === "trail") {
    const trail = trails.find((t) => t.id === place.id) as Trail | undefined;
    if (trail?.trailheadCoords) return trail.trailheadCoords;
    return getRegionCentroid(place.region);
  }

  if (place.type === "winery") {
    const winery = wineries.find((w) => w.id === place.id) as Winery | undefined;
    if (winery && typeof winery.latitude === "number" && typeof winery.longitude === "number") {
      return { lat: winery.latitude, lng: winery.longitude };
    }
    return getRegionCentroid(place.region);
  }

  if (place.type === "restaurant") {
    const restaurant = restaurants.find((r) => r.id === place.id);
    if (restaurant && typeof restaurant.latitude === "number" && typeof restaurant.longitude === "number") {
      return { lat: restaurant.latitude, lng: restaurant.longitude };
    }
    return getRegionCentroid(place.region);
  }

  return getRegionCentroid(place.region);
}
