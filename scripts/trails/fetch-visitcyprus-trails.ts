/**
 * Fetch official Visit Cyprus trail hero images and metadata.
 *
 *   npm run trails:fetch-images
 *
 * Writes:
 *   - public/images/cyprus/trails/trail-{id}.jpg (mapped trails)
 *   - public/images/cyprus/trails/vc-{slug}.jpg (unmapped slugs)
 *   - scripts/trails/visitcyprus-manifest.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VISITCYPRUS_SLUG_TO_TRAIL_ID,
  VISITCYPRUS_TRAIL_PAGE_URLS,
  VISITCYPRUS_UNMAPPED_SLUGS,
} from "./visitcyprus-slug-map";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const outDir = join(root, "public/images/cyprus/trails");
const manifestPath = join(here, "visitcyprus-manifest.json");

const UA = "CyprusWinter/2.0 (trail-image-intake; +https://github.com/G9MaGiC/cyprus-winter)";

export type VisitCyprusTrailRecord = {
  slug: string;
  url: string;
  title: string | null;
  imageUrl: string;
  localPath: string;
  trailId: string | null;
  fetchedAt: string;
};

function slugFromUrl(url: string): string {
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1] ?? url;
}

function extractTitle(html: string): string | null {
  const og = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (og?.[1]) return og[1].replace(/\s*-\s*Visit Cyprus\s*$/i, "").trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return h1?.[1]?.trim() ?? null;
}

function extractHeroImage(html: string): string | null {
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (og?.[1] && !og[1].includes("visitcyprus-logo")) return og[1];
  const imgs = [...html.matchAll(/wp-content\/uploads\/[^"'\s]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0]);
  const hero = imgs.find((p) => !p.includes("logo") && !p.includes("button_download"));
  return hero ? `https://www.visitcyprus.com/${hero.replace(/^\//, "")}` : null;
}

function localFilename(slug: string): { path: string; trailId: string | null } {
  const trailId = VISITCYPRUS_SLUG_TO_TRAIL_ID[slug] ?? null;
  const name = trailId ? `trail-${trailId}.jpg` : `vc-${slug.slice(0, 48)}.jpg`;
  return { path: join(outDir, name), trailId };
}

export async function fetchVisitCyprusTrails(): Promise<VisitCyprusTrailRecord[]> {
  await mkdir(outDir, { recursive: true });
  const seen = new Set<string>();
  const records: VisitCyprusTrailRecord[] = [];

  for (const pageUrl of VISITCYPRUS_TRAIL_PAGE_URLS) {
    const slug = slugFromUrl(pageUrl);
    if (seen.has(slug)) continue;
    seen.add(slug);

    const res = await fetch(pageUrl, { headers: { "User-Agent": UA, Accept: "text/html" } });
    if (!res.ok) {
      console.warn(`SKIP ${slug}: HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const title = extractTitle(html);
    const imageUrl = extractHeroImage(html);
    if (!imageUrl) {
      console.warn(`SKIP ${slug}: no hero image`);
      continue;
    }

    const { path: filePath, trailId } = localFilename(slug);
    const imgRes = await fetch(imageUrl, { headers: { "User-Agent": UA } });
    if (!imgRes.ok) {
      console.warn(`SKIP ${slug}: image HTTP ${imgRes.status}`);
      continue;
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    await writeFile(filePath, buf);

    const localPath = `/images/cyprus/trails/${filePath.split("/trails/")[1]}`;
    records.push({
      slug,
      url: pageUrl,
      title,
      imageUrl,
      localPath,
      trailId,
      fetchedAt: new Date().toISOString(),
    });
    console.log(`OK ${slug} → ${localPath}${trailId ? ` (${trailId})` : " (unmapped)"}`);
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        source: "visitcyprus.com",
        license: "Cyprus Tourism Organisation promotional assets — attribution required in docs",
        fetchedAt: new Date().toISOString(),
        mappedCount: records.filter((r) => r.trailId).length,
        unmappedSlugs: [...VISITCYPRUS_UNMAPPED_SLUGS],
        trails: records,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Wrote ${manifestPath} (${records.length} trails)`);
  return records;
}

async function main(): Promise<void> {
  const records = await fetchVisitCyprusTrails();
  const mapped = records.filter((r) => r.trailId).length;
  console.log(`Done: ${mapped} mapped, ${records.length - mapped} unmapped`);
}

void main();
