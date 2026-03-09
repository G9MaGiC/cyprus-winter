import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";

export type DiscoverItem = Attraction | Winery | Restaurant;

export const allDiscoverItems: DiscoverItem[] = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...wineries,
  ...restaurants,
  ...monasteries,
];

export const allDiscoverIds = allDiscoverItems.map((item) => item.id);
