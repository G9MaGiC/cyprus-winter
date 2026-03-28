import { trails } from "@/data/trails";
import type { TrailDifficulty } from "@/data/trails";

export type SearchTrailsInput = {
  query?: string;
  region?: string;
  difficulty?: TrailDifficulty;
  season?: string;
  limit?: number;
};

export function searchTrails(input: SearchTrailsInput) {
  let candidates = [...trails];

  if (input.region) {
    candidates = candidates.filter((t) => t.region.toLowerCase().includes(input.region!.toLowerCase()));
  }
  if (input.difficulty) {
    candidates = candidates.filter((t) => t.difficulty === input.difficulty);
  }

  const scored = candidates.map((t) => {
    let score = 0;
    const q = (input.query ?? "").toLowerCase();

    // Keyword match
    if (q && (t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) {
      score += 0.4;
    }

    // Season fit
    if (input.season && t.bestSeason.includes(input.season as "winter")) {
      score += 0.3;
    }

    // Prefer easier trails for general queries
    if (!input.difficulty) {
      score += 0.1 * (t.difficulty === "easy" ? 1 : t.difficulty === "moderate" ? 0.7 : 0.3);
    }

    return { trail: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, input.limit ?? 5).map((s) => s.trail);
}
