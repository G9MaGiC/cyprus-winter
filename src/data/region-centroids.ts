/**
 * Approximate lat/lng centroids for Cyprus regions.
 * Used when places lack exact coordinates (attractions, restaurants, most wineries, events).
 * Fallback for place-coords resolver.
 */
import type { RegionSlug } from "@/data/regions";

export const REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  /* Main regions */
  All: { lat: 34.95, lng: 33.2 }, // Island-wide events: central Cyprus
  Troodos: { lat: 34.93, lng: 32.87 },
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
  /* Mountain / Troodos area */
  Platres: { lat: 34.88, lng: 32.87 },
  "Kato Platres": { lat: 34.87, lng: 32.86 },
  Kyperounta: { lat: 34.95, lng: 32.98 },
  Pitsilia: { lat: 34.92, lng: 33.00 },
  /* Wine villages - Krasochoria / Limassol */
  Omodos: { lat: 34.847, lng: 32.808 },
  Koilani: { lat: 34.823, lng: 32.892 },
  Pelendri: { lat: 34.896, lng: 32.965 },
  Silikou: { lat: 34.83, lng: 32.88 },
  Vasa: { lat: 34.84, lng: 32.91 },
  "Vasa Koilaniou": { lat: 34.84, lng: 32.91 },
  Pachna: { lat: 34.78, lng: 32.79 },
  Monagri: { lat: 34.82, lng: 32.90 },
  Dhoros: { lat: 34.84, lng: 32.88 },
  Kilani: { lat: 34.82, lng: 32.86 },
  Souni: { lat: 34.73, lng: 32.87 },
  Mallia: { lat: 34.72, lng: 32.85 },
  Mandria: { lat: 34.71, lng: 32.82 },
  "Pera Pedi": { lat: 34.84, lng: 32.85 },
  "Agios Theodoros": { lat: 34.72, lng: 32.84 },
  "Agios Theodoros Pitsilias": { lat: 34.93, lng: 33.01 },
  "Agios Silas": { lat: 34.92, lng: 32.99 },
  "Agios Mamas": { lat: 34.74, lng: 32.73 },
  "Agios Tychonas": { lat: 34.72, lng: 33.14 },
  "Agios Amvrosios": { lat: 34.71, lng: 32.80 },
  "Ayios Silas": { lat: 34.92, lng: 32.99 },
  /* Wine villages - Paphos */
  Kathikas: { lat: 34.839, lng: 32.382 },
  Panayia: { lat: 34.92, lng: 32.62 },
  "Pano Panayia": { lat: 34.92, lng: 32.62 },
  Statos: { lat: 34.85, lng: 32.56 },
  "Statos-Ayios Fotios": { lat: 34.85, lng: 32.56 },
  Stroumbi: { lat: 34.91, lng: 32.43 },
  Lemona: { lat: 34.84, lng: 32.51 },
  Kannaviou: { lat: 34.84, lng: 32.55 },
  Letymbou: { lat: 34.86, lng: 32.47 },
  Miliou: { lat: 34.94, lng: 32.53 },
  Amargeti: { lat: 34.86, lng: 32.54 },
  Phinikas: { lat: 34.85, lng: 32.50 },
  "Agios Dimitrianos": { lat: 34.90, lng: 32.57 },
  "Agios Georgios": { lat: 34.88, lng: 32.37 },
  "Pano Archimandrita": { lat: 34.93, lng: 32.58 },
  "Mesogi / Stroumbi": { lat: 34.82, lng: 32.45 },
  /* Larnaca / Nicosia area */
  "Kato Drys": { lat: 34.851, lng: 33.304 },
  Skarinou: { lat: 34.78, lng: 33.35 },
  "Kalo Chorio Orinis": { lat: 35.05, lng: 33.25 },
  Fikardou: { lat: 34.97, lng: 33.18 },
  Vouni: { lat: 34.82, lng: 32.77 },
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
 * - Winery/restaurant format: "Platres (Limassol)", "Kathikas (Paphos)"
 *   Prefers the specific location (before parens) when it has a centroid, else uses district.
 */
export function getRegionCentroid(region: string): { lat: number; lng: number } | null {
  const r = region.trim();
  if (REGION_CENTROIDS[r]) return REGION_CENTROIDS[r];

  const parenMatch = r.match(/^([^(]+)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const specific = parenMatch[1].trim();
    const parent = parenMatch[2].trim();
    if (REGION_CENTROIDS[specific]) return REGION_CENTROIDS[specific];
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
