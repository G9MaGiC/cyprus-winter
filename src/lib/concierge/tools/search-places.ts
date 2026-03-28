import { beaches, ancientSites, villages, monasteries, natureSites } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { rankPlaces, type RankablePlace } from "../ranking";

export type SearchPlacesInput = {
  query?: string;
  region?: string;
  categories?: string[];
  season?: string;
  userLocation?: { lat: number; lng: number };
  limit?: number;
};

const ALL_PLACES: RankablePlace[] = [
  ...beaches.map((p) => ({ ...p, type: p.type })),
  ...ancientSites.map((p) => ({ ...p, type: p.type })),
  ...villages.map((p) => ({ ...p, type: p.type })),
  ...monasteries.map((p) => ({ ...p, type: p.type })),
  ...natureSites.map((p) => ({ ...p, type: p.type })),
  ...wineries.map((w) => ({ ...w, type: "winery" as const })),
  ...restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    region: r.region,
    description: r.description,
    type: "restaurant" as const,
    highlights: r.highlights ?? [],
    bestFor: r.bestFor ?? [],
    latitude: r.latitude,
    longitude: r.longitude,
  })),
];

export function searchPlaces(input: SearchPlacesInput): RankablePlace[] {
  let candidates = ALL_PLACES;

  if (input.region) {
    const r = input.region.toLowerCase();
    candidates = candidates.filter((p) => p.region.toLowerCase().includes(r));
  }

  if (input.categories?.length) {
    const cats = input.categories.map((c) => c.toLowerCase());
    candidates = candidates.filter((p) => {
      const t = (p.type ?? "").toLowerCase();
      return cats.includes(t);
    });
  }

  return rankPlaces(candidates, {
    query: input.query,
    season: input.season,
    category: input.categories?.[0],
    userLocation: input.userLocation,
    limit: input.limit ?? 5,
  });
}
