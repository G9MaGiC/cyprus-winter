/**
 * Curated trail sections for the trails page.
 * Shown when no filters are active.
 */

import { trails } from "@/data/trails";
import type { Trail } from "@/data/trails";

export type TrailSection = {
  id: string;
  title: string;
  trailIds: string[];
};

const sectionDefs: TrailSection[] = [
  {
    id: "winter-highlights",
    title: "Winter highlights",
    trailIds: ["artemis", "atalante", "adonis", "cape-greco", "caledonia-falls"],
  },
  {
    id: "family-friendly",
    title: "Family-friendly",
    trailIds: trails
      .filter((t) => t.difficulty === "easy" && t.lengthKm <= 3)
      .map((t) => t.id)
      .slice(0, 10),
  },
  {
    id: "waterfall",
    title: "Waterfall trails",
    trailIds: [
      "caledonia-falls",
      "millomeris-falls",
      "avakas-gorge",
      "mesa-potamos",
    ],
  },
  {
    id: "coastal",
    title: "Coastal escapes",
    trailIds: [
      "cape-greco",
      "petra-tou-romiou",
      "kavos-trail",
      "sea-caves-anargyroi",
    ],
  },
  {
    id: "peak-views",
    title: "Peak views",
    trailIds: ["olympus-summit", "madari-ridge", "stavrovouni"],
  },
  {
    id: "full-day",
    title: "Full-day challenges",
    trailIds: ["horteri", "caledonia-alternative", "kykkos-konizi"],
  },
];

const trailById = new Map(trails.map((t) => [t.id, t]));

export function buildTrailSections(): { id: string; title: string; trails: Trail[] }[] {
  return sectionDefs
    .map((s) => ({
      id: s.id,
      title: s.title,
      trails: s.trailIds
        .map((id) => trailById.get(id))
        .filter((t): t is Trail => t != null),
    }))
    .filter((s) => s.trails.length > 0);
}
