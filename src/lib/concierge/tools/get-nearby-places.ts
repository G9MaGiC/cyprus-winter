import { beaches, ancientSites, villages, monasteries, natureSites } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { trails } from "@/data/trails";

type PlaceWithCoords = {
  id: string;
  name: string;
  region: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ALL_COORDS: PlaceWithCoords[] = [
  ...[...beaches, ...ancientSites, ...villages, ...monasteries, ...natureSites]
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ id: p.id, name: p.name, region: p.region, type: p.type, latitude: p.latitude!, longitude: p.longitude! })),
  ...wineries
    .filter((w) => w.latitude != null && w.longitude != null)
    .map((w) => ({ id: w.id, name: w.name, region: w.region, type: "winery", latitude: w.latitude!, longitude: w.longitude! })),
  ...trails
    .filter((t) => t.trailheadCoords != null)
    .map((t) => ({ id: t.id, name: t.name, region: t.region, type: "trail", latitude: t.trailheadCoords!.lat, longitude: t.trailheadCoords!.lng })),
];

export type GetNearbyInput = {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
};

export function getNearbyPlaces(input: GetNearbyInput): (PlaceWithCoords & { distanceKm: number })[] {
  const { lat, lng, radiusKm = 30, limit = 10 } = input;

  const withDist = ALL_COORDS.map((p) => ({
    ...p,
    distanceKm: haversineKm(lat, lng, p.latitude, p.longitude),
  }));

  return withDist
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
