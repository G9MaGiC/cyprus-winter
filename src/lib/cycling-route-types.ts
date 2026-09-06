/** Visit Cyprus official cycling route metadata (curated intake). */
export const CYCLING_ROUTE_REGIONS = [
  "lefkosia",
  "lemesos",
  "larnaka",
  "pafos",
  "ammochostos",
  "troodos",
] as const;

export type CyclingRouteRegion = (typeof CYCLING_ROUTE_REGIONS)[number];

export type CyclingBikeType = "road" | "mtb" | "any";
export type CyclingSurface = "paved" | "unpaved" | "mixed";
export type CyclingDifficulty = "easy" | "moderate" | "demanding";

export type CyclingRoute = {
  id: string;
  name: string;
  region: CyclingRouteRegion;
  /** Official distance in km when published by Visit Cyprus. */
  distanceKm: number | null;
  elevationGainM?: number;
  isLoop?: boolean;
  bikeType: CyclingBikeType;
  surface: CyclingSurface;
  difficulty: CyclingDifficulty;
  description: string;
  winterNote?: string;
  visitCyprusUrl: string;
  gpxUrl?: string;
  /** Optional link to a curated discover/activity place in our data. */
  relatedPlaceId?: string;
  /** Featured on the winter cycling hub. */
  winterPick?: boolean;
};

/** Client-safe (no data import): renders "16 km" / "131.2 km". */
export function formatRouteDistance(km: number | null): string | null {
  if (km == null) return null;
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
}

export const VC_CYCLING_INDEX_URL =
  "https://www.visitcyprus.com/discover-cyprus/routes/cycling-routes-routes/" as const;

export const VC_CYCLING_NATURE_URL =
  "https://www.visitcyprus.com/discover-cyprus/nature/cycling/" as const;
