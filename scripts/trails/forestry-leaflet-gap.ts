/**
 * Report Forestry leaflet PDFs vs app trail image coverage.
 *
 *   npm run trails:forestry-leaflet-gap
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trails } from "../../src/data/trails";
import { classifyTrailImageSource } from "../../src/lib/cyprus-images";
import {
  FORESTRY_PDF_UNMAPPED_TRAIL_IDS,
  normalizePdfKey,
  pdfToTrailId,
} from "./forestry-pdf-map";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, "forestry-outside-manifest.json");

type Manifest = {
  leaflets: { district: string; pdfs: string[] }[];
};

async function main(): Promise<void> {
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  const appIds = new Set(trails.map((t) => t.id));

  const seenPdfs = new Set<string>();
  const pdfToId = new Map<string, string>();
  const unmappedPdfs: string[] = [];

  for (const leaflet of manifest.leaflets) {
    for (const url of leaflet.pdfs) {
      const key = normalizePdfKey(url);
      if (seenPdfs.has(key)) continue;
      seenPdfs.add(key);
      const trailId = pdfToTrailId(url);
      if (trailId) pdfToId.set(key, trailId);
      else unmappedPdfs.push(key);
    }
  }

  console.log("=== Forestry leaflet PDF gap ===\n");
  console.log(`Unique PDFs in manifest: ${seenPdfs.size}`);
  console.log(`Mapped to trail ids: ${pdfToId.size}\n`);

  const needsHero: { trailId: string; pdf: string; source: string }[] = [];
  const hasOfficial: string[] = [];
  const missingFromApp: string[] = [];

  for (const [pdf, trailId] of pdfToId) {
    if (!appIds.has(trailId)) {
      missingFromApp.push(trailId);
      continue;
    }
    const src = classifyTrailImageSource(trailId);
    if (src === "official") hasOfficial.push(trailId);
    else needsHero.push({ trailId, pdf, source: src });
  }

  if (needsHero.length) {
    console.log("Trails with Forestry PDF but no official hero:");
    for (const r of needsHero) console.log(`  - ${r.trailId} (${r.source}) ← ${r.pdf}`);
    console.log();
  }

  if (hasOfficial.length) {
    console.log("Already have official/VC hero:");
    for (const id of hasOfficial) console.log(`  ✓ ${id}`);
    console.log();
  }

  if (missingFromApp.length) {
    console.log("PDF maps to trail id not in app:");
    for (const id of [...new Set(missingFromApp)]) console.log(`  - ${id}`);
    console.log();
  }

  for (const id of FORESTRY_PDF_UNMAPPED_TRAIL_IDS) {
    if (!appIds.has(id)) console.log(`Catalog gap (PDF exists): ${id}`);
  }

  if (unmappedPdfs.length) {
    console.log("\nUnmapped PDF filenames (extend forestry-pdf-map.ts):");
    for (const p of unmappedPdfs.sort()) console.log(`  - ${p}`);
  }

  console.log(`\nForestry PDF heroes: npm run trails:extract-forestry-heroes (requires poppler-utils).`);
}

void main();
