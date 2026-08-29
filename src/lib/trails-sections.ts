/**
 * Curated trail sections for the trails page.
 * Shown when no filters are active.
 * Titles come from `trails.sections.*` message keys (by section id).
 */

import { trails } from "@/data/trails";
import type { Trail } from "@/data/trails";

export type TrailSectionDef = {
  id: string;
  trailIds: string[];
};

/** Trails shown in the coastal section — used for Plan rural/mountain vs beach mix. */
export const COASTAL_TRAIL_IDS = [
  "cape-greco",
  "petra-tou-romiou",
  "kavos-trail",
  "sea-caves-anargyroi",
  "konnoi-cyclops",
  "agioi-anargyroi-circular",
  "aphrodite-cape-greco",
] as const;

const sectionDefs: TrailSectionDef[] = [
  {
    id: "winter-highlights",
    trailIds: ["artemis", "atalante", "adonis", "cape-greco", "caledonia-falls"],
  },
  {
    id: "family-friendly",
    trailIds: trails
      .filter((t) => t.difficulty === "easy" && t.lengthKm <= 3)
      .map((t) => t.id)
      .slice(0, 10),
  },
  {
    id: "waterfall",
    trailIds: [
      "caledonia-falls",
      "millomeris-falls",
      "trooditissa-phini",
      "avakas-gorge",
      "mesa-potamos",
    ],
  },
  {
    id: "coastal",
    trailIds: [...COASTAL_TRAIL_IDS],
  },
  {
    id: "peak-views",
    trailIds: ["olympus-summit", "madari-ridge", "stavrovouni-trail"],
  },
  {
    id: "full-day",
    trailIds: [
      "horteri",
      "caledonia-alternative",
      "kykkos-konizi",
      "psilo-dentro-pouziaris",
      "kannoures-agios-nikolaos",
    ],
  },
];

const trailById = new Map(trails.map((t) => [t.id, t]));

export function buildTrailSections(): { id: string; trails: Trail[] }[] {
  return sectionDefs
    .map((s) => ({
      id: s.id,
      trails: s.trailIds
        .map((id) => trailById.get(id))
        .filter((t): t is Trail => t != null),
    }))
    .filter((s) => s.trails.length > 0);
}
