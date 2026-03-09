import {
  beaches,
  ancientSites,
  villages,
  monasteries,
  natureSites,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { trails } from "@/data/trails";
import { winterEvents } from "@/data/events";
import { guides, getGuideById } from "@/data/guides";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";

export const allAttractions: Attraction[] = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...monasteries,
  ...wineries,
];

export type PlanItem = {
  id: string;
  name: string;
  region: string;
  type: "attraction" | "trail" | "winery" | "event" | "restaurant";
};

const baseAttractions = [...beaches, ...natureSites, ...ancientSites, ...villages, ...monasteries];

export const allPlaces: PlanItem[] = [
  ...baseAttractions.map((a) => ({
    id: a.id,
    name: a.name,
    region: a.region,
    type: "attraction" as const,
  })),
  ...wineries.map((w) => ({
    id: w.id,
    name: w.name,
    region: w.region,
    type: "winery" as const,
  })),
  ...restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    region: r.region,
    type: "restaurant" as const,
  })),
  ...trails.map((t) => ({
    id: t.id,
    name: t.name,
    region: t.region,
    type: "trail" as const,
  })),
  ...winterEvents.map((e) => ({
    id: e.id,
    name: e.name,
    region: e.region,
    type: "event" as const,
  })),
];

/** Resolve a place by id or trail slug (attraction, winery, restaurant, trail, event). Events and trails (by id or slug) are supported for add-to-plan. */
export function getPlaceById(id: string): PlanItem | undefined {
  const byId = allPlaces.find((p) => p.id === id);
  if (byId) return byId;
  const bySlug = trails.find((t) => t.slug === id);
  if (bySlug) {
    return allPlaces.find((p) => p.id === bySlug.id);
  }
  return undefined;
}

/** Resolve a discover place by id (attraction, winery, or restaurant). Used for detail pages. */
export function getAttractionById(id: string): Attraction | undefined {
  return allAttractions.find((a) => a.id === id);
}

/** Resolve a restaurant by id. */
export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id);
}

/** Resolve a discover place by id (attraction, winery, or restaurant). */
export function getDiscoverPlaceById(id: string): Attraction | Restaurant | undefined {
  const attraction = getAttractionById(id);
  if (attraction) return attraction;
  return getRestaurantById(id);
}

export { guides, getGuideById };
export { allDiscoverItems, allDiscoverIds } from "./discover";
