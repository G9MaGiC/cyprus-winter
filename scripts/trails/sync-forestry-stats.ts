/**
 * Compare fd56 Forestry stats against src/data/trails.ts for mapped trail ids.
 *
 *   npm run trails:sync-forestry-stats
 *
 * Prints length/duration/difficulty mismatches. Exit 1 if any remain.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trails, type TrailDifficulty } from "../../src/data/trails";
import { forestryNameToTrailId } from "./forestry-name-map";
import { gradeToDifficulty } from "./forestry-parse-utils";
import type { ForestryOutsideRecord } from "./scrape-forestry-trails";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, "forestry-outside-manifest.json");

type Manifest = { trails: ForestryOutsideRecord[] };

type Mismatch = {
  trailId: string;
  field: string;
  forestry: string;
  app: string;
};

function fmtDiff(a: number | null | undefined, b: number): string {
  if (a == null) return `? vs ${b}`;
  return `${a} vs ${b}`;
}

async function main(): Promise<void> {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  const byId = new Map(trails.map((t) => [t.id, t]));
  const mismatches: Mismatch[] = [];

  for (const ft of manifest.trails) {
    const trailId = forestryNameToTrailId(ft.name);
    if (!trailId) continue;
    const app = byId.get(trailId);
    if (!app) continue;

    const fdDiff = gradeToDifficulty(ft.difficultyGrade);
    if (app.difficulty !== fdDiff) {
      mismatches.push({
        trailId,
        field: "difficulty",
        forestry: `${ft.difficultyGrade} → ${fdDiff}`,
        app: app.difficulty,
      });
    }
    if (ft.lengthKm != null && Math.abs(app.lengthKm - ft.lengthKm) > 0.15) {
      mismatches.push({
        trailId,
        field: "lengthKm",
        forestry: String(ft.lengthKm),
        app: String(app.lengthKm),
      });
    }
    if (ft.durationMin != null && Math.abs(app.durationMin - ft.durationMin) > 20) {
      mismatches.push({
        trailId,
        field: "durationMin",
        forestry: String(ft.durationMin),
        app: String(app.durationMin),
      });
    }
  }

  console.log("=== Forestry fd56 stats sync check ===\n");
  if (mismatches.length === 0) {
    console.log("All mapped trails align with fd56 stats (within tolerance).");
    return;
  }

  for (const m of mismatches) {
    console.log(`${m.trailId}.${m.field}: fd56 ${m.forestry} | app ${m.app}`);
  }
  console.log(`\n${mismatches.length} mismatch(es). Update src/data/trails.ts to match fd56.`);
  process.exitCode = 1;
}

void main();
