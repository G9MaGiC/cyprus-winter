/**
 * Extract trail hero images from Forestry four-fold PDF leaflets (poppler + sharp).
 *
 * Requires: poppler-utils (`pdftoppm`) on PATH.
 *
 *   npm run trails:extract-forestry-heroes
 *
 * Writes: public/images/cyprus/trails/trail-{id}.jpg
 */
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pdfToTrailId } from "./forestry-pdf-map";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const outDir = join(root, "public/images/cyprus/trails");
const manifestPath = join(here, "forestry-outside-manifest.json");

/** Crop regions as fractions of rendered page (x, y, width, height). */
const CROP: Record<string, { x: number; y: number; w: number; h: number; page?: number }> = {
  "moni-fylagra": { x: 0, y: 0.52, w: 0.34, h: 0.48, page: 1 },
  chorteri: { x: 0, y: 0.55, w: 0.33, h: 0.45, page: 1 },
  "argakas-dam": { x: 0.34, y: 0.08, w: 0.33, h: 0.42, page: 1 },
  symvoulas: { x: 0, y: 0.05, w: 0.5, h: 0.35, page: 1 },
  "venetian-bridges": { x: 0, y: 0.22, w: 0.28, h: 0.55, page: 1 },
  "troodos-visitor-centre": { x: 0.38, y: 0.22, w: 0.22, h: 0.32, page: 1 },
};

type Manifest = {
  leaflets: { district: string; pdfs: string[] }[];
};

function requirePdftoppm(): void {
  try {
    execFileSync("pdftoppm", ["-v"], { stdio: "ignore" });
  } catch {
    console.error("pdftoppm not found. Install poppler-utils (apt install poppler-utils).");
    process.exit(1);
  }
}

async function renderPage(pdfPath: string, page: number, tmp: string): Promise<string> {
  const prefix = join(tmp, "page");
  execFileSync("pdftoppm", ["-jpeg", "-r", "150", "-f", String(page), "-l", String(page), pdfPath, prefix], {
    stdio: "inherit",
  });
  return `${prefix}-${page}.jpg`;
}

async function downloadPdf(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { headers: { "User-Agent": "CyprusWinter/2.0 (forestry-hero-intake)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function extractHero(
  trailId: string,
  pdfUrl: string,
  tmp: string,
): Promise<{ trailId: string; outPath: string; bytes: number }> {
  const crop = CROP[trailId];
  if (!crop) throw new Error(`No crop config for ${trailId}`);

  const pdfPath = join(tmp, `${trailId}.pdf`);
  await downloadPdf(pdfUrl, pdfPath);

  const rendered = await renderPage(pdfPath, crop.page ?? 1, tmp);
  const img = sharp(await readFile(rendered));
  const meta = await img.metadata();
  const W = meta.width ?? 2600;
  const H = meta.height ?? 1400;

  const left = Math.round(crop.x * W);
  const top = Math.round(crop.y * H);
  const width = Math.round(crop.w * W);
  const height = Math.round(crop.h * H);

  const outPath = join(outDir, `trail-${trailId}.jpg`);
  const buf = await img
    .extract({ left, top, width, height })
    .resize(1200, 675, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  await writeFile(outPath, buf);
  return { trailId, outPath, bytes: buf.length };
}

async function main(): Promise<void> {
  requirePdftoppm();
  await mkdir(outDir, { recursive: true });

  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;

  const pdfByTrail = new Map<string, string>();
  for (const leaflet of manifest.leaflets) {
    for (const url of leaflet.pdfs) {
      const id = pdfToTrailId(url);
      if (id && CROP[id] && !pdfByTrail.has(id)) pdfByTrail.set(id, url);
    }
  }

  const tmp = await mkdtemp(join(tmpdir(), "forestry-hero-"));
  const results: { trailId: string; outPath: string; bytes: number }[] = [];
  const errors: string[] = [];

  try {
    for (const trailId of Object.keys(CROP)) {
      const url = pdfByTrail.get(trailId);
      if (!url) {
        errors.push(`${trailId}: no PDF URL in manifest`);
        continue;
      }
      try {
        const r = await extractHero(trailId, url, tmp);
        results.push(r);
        console.log(`✓ ${trailId} → ${r.outPath} (${Math.round(r.bytes / 1024)} KB)`);
      } catch (e) {
        errors.push(`${trailId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }

  console.log(`\nExtracted ${results.length}/${Object.keys(CROP).length} forestry heroes.`);
  if (errors.length) {
    console.error("\nErrors:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}

void main();
