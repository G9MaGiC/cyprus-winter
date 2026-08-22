/**
 * Compare Forestry fd56 manifest to src/data/trails.ts catalog.
 *
 *   npm run trails:forestry-gap
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trails } from "../../src/data/trails";
import { FORESTRY_TRAILS_TO_ADD, forestryNameToTrailId } from "./forestry-name-map";
import type { ForestryOutsideRecord } from "./scrape-forestry-trails";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, "forestry-outside-manifest.json");

type Manifest = {
  trails: ForestryOutsideRecord[];
};

async function main(): Promise<void> {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  const appIds = new Set(trails.map((t) => t.id));

  const mapped: { forestry: string; trailId: string; inApp: boolean }[] = [];
  const unmappedForestry: string[] = [];
  const missingFromApp: { trailId: string; forestry: string }[] = [];
  const inAppNotForestry: string[] = [];

  for (const ft of manifest.trails) {
    const trailId = forestryNameToTrailId(ft.name);
    if (!trailId) {
      unmappedForestry.push(ft.name);
      continue;
    }
    const inApp = appIds.has(trailId);
    mapped.push({ forestry: ft.name, trailId, inApp });
    if (!inApp) missingFromApp.push({ trailId, forestry: ft.name });
  }

  for (const id of FORESTRY_TRAILS_TO_ADD) {
    if (!appIds.has(id)) {
      const already = missingFromApp.some((m) => m.trailId === id);
      if (!already) missingFromApp.push({ trailId: id, forestry: "(planned)" });
    }
  }

  for (const id of appIds) {
    const isForestryMapped = manifest.trails.some((t) => forestryNameToTrailId(t.name) === id);
    if (!isForestryMapped && FORESTRY_TRAILS_TO_ADD.includes(id as (typeof FORESTRY_TRAILS_TO_ADD)[number])) {
      inAppNotForestry.push(id);
    }
  }

  console.log("=== Forestry fd56 gap analysis ===\n");
  console.log(`Forestry outside-forest trails: ${manifest.trails.length}`);
  console.log(`App catalog: ${appIds.size}`);
  console.log(`Mapped to app ids: ${mapped.length}`);
  console.log(`In app (mapped): ${mapped.filter((m) => m.inApp).length}`);
  console.log(`Missing from app: ${missingFromApp.length}\n`);

  if (missingFromApp.length) {
    console.log("Missing trails (add to src/data/trails.ts):");
    for (const m of missingFromApp) {
      console.log(`  - ${m.trailId} ← ${m.forestry}`);
    }
    console.log();
  }

  if (unmappedForestry.length) {
    console.log("Unmapped forestry names (update forestry-name-map.ts):");
    for (const n of unmappedForestry) console.log(`  - ${n}`);
    console.log();
  }

  const alreadyInApp = mapped.filter((m) => m.inApp);
  if (alreadyInApp.length) {
    console.log("Already in app:");
    for (const m of alreadyInApp) console.log(`  ✓ ${m.trailId} ← ${m.forestry}`);
  }

  if (missingFromApp.length > 0) process.exitCode = 1;
}

void main();
