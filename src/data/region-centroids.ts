/**
 * Approximate lat/lng centroids for Cyprus regions.
 * Used when places lack exact coordinates (attractions, restaurants, most wineries, events).
 * Fallback for place-coords resolver.
 */
export const REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Troodos: { lat: 34.93, lng: 32.87 },
  Platres: { lat: 34.88, lng: 32.87 },
  Paphos: { lat: 34.77, lng: 32.42 },
  Limassol: { lat: 34.68, lng: 33.04 },
  Lemesos: { lat: 34.68, lng: 33.04 },
  Larnaca: { lat: 34.92, lng: 33.63 },
  "Ayia Napa": { lat: 34.99, lng: 34.0 },
  Protaras: { lat: 35.01, lng: 34.06 },
  "Cape Greco": { lat: 34.96, lng: 34.07 },
  Nicosia: { lat: 35.18, lng: 33.38 },
  Famagusta: { lat: 35.12, lng: 33.95 },
  Kyrenia: { lat: 35.34, lng: 33.32 },
};

/** Map winery/restaurant region strings (e.g. "Pelendri (Limassol)") to primary region for centroid lookup */
const REGION_ALIASES: Record<string, string> = {
  Limassol: "Limassol",
  Paphos: "Paphos",
  Larnaca: "Larnaca",
  Troodos: "Troodos",
  Nicosia: "Nicosia",
  Kyrenia: "Kyrenia",
  Famagusta: "Famagusta",
  "Ayia Napa": "Ayia Napa",
};

/**
 * Resolve a region string to centroid. Handles:
 * - Direct match: "Limassol", "Troodos", "Paphos"
 * - Winery/restaurant format: "Pelendri (Limassol)", "Kathikas (Paphos)"
 */
import type { RegionSlug } from "@/data/regions";

/** Map region slug to centroid for Right Now region picker */
export const REGION_CENTROID_BY_SLUG: Record<RegionSlug, { lat: number; lng: number }> = {
  troodos: REGION_CENTROIDS.Troodos,
  paphos: REGION_CENTROIDS.Paphos,
  limassol: REGION_CENTROIDS.Limassol,
  larnaca: REGION_CENTROIDS.Larnaca,
  "ayia-napa": REGION_CENTROIDS["Ayia Napa"],
};

export function getCentroidBySlug(slug: RegionSlug): { lat: number; lng: number } {
  return REGION_CENTROID_BY_SLUG[slug];
}

/**
 * Resolve a region string to centroid. Handles:
 * - Direct match: "Limassol", "Troodos", "Paphos"
 * - Winery/restaurant format: "Pelendri (Limassol)", "Kathikas (Paphos)"
 */
export function getRegionCentroid(region: string): { lat: number; lng: number } | null {
  const r = region.trim();
  if (REGION_CENTROIDS[r]) return REGION_CENTROIDS[r];

  const parenMatch = r.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parent = parenMatch[1].trim();
    if (REGION_CENTROIDS[parent]) return REGION_CENTROIDS[parent];
    if (REGION_ALIASES[parent] && REGION_CENTROIDS[REGION_ALIASES[parent]]) {
      return REGION_CENTROIDS[REGION_ALIASES[parent]];
    }
  }

  for (const [key, centroid] of Object.entries(REGION_CENTROIDS)) {
    if (r.toLowerCase().includes(key.toLowerCase())) return centroid;
  }

  return null;
}
