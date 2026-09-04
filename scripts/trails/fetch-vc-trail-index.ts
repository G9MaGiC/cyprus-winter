/**
 * Fetch Visit Cyprus nature-trail slugs from the public index and post sitemaps.
 *
 *   npm run trails:fetch-index
 *
 * Note: the VC index paginates via client-side JS (3 pages). This script captures
 * page-1 index links plus the fuller English catalog from WordPress post sitemaps.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VC_SITEMAP_INDEX_URL,
  VC_TRAIL_INDEX_IGNORE_SLUGS,
  VC_TRAIL_SLUG_PATH_PREFIX,
  VC_TRAILS_INDEX_URL,
} from "../../src/lib/trail-vc-types";
import { VISITCYPRUS_ALT_TRAIL_SLUGS } from "./visitcyprus-slug-map";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "vc-trail-index.json");

const UA = "CyprusWinter-trail-intake/1.0";

const INDEX_SLUG_RE =
  /href="https:\/\/www\.visitcyprus\.com\/discover-cyprus\/nature\/nature-trails-2\/([a-z0-9-]+)\/?"/gi;

const SITEMAP_SLUG_RE = new RegExp(
  `${VC_TRAIL_SLUG_PATH_PREFIX.replace(/\//g, "\\/")}([a-z0-9-]+)`,
  "gi",
);

export function extractIndexTrailSlugs(html: string): string[] {
  const slugs = new Set<string>();
  for (const match of html.matchAll(INDEX_SLUG_RE)) {
    const slug = match[1];
    if (VC_TRAIL_INDEX_IGNORE_SLUGS.has(slug)) continue;
    slugs.add(slug);
  }
  return [...slugs].sort();
}

export function extractSitemapTrailSlugs(xml: string): string[] {
  const slugs = new Set<string>();
  for (const match of xml.matchAll(SITEMAP_SLUG_RE)) {
    const slug = match[1];
    if (VC_TRAIL_INDEX_IGNORE_SLUGS.has(slug)) continue;
    slugs.add(slug);
  }
  return [...slugs].sort();
}

export function extractAltTrailSlugs(xml: string): string[] {
  const slugs = new Set<string>();
  for (const slug of VISITCYPRUS_ALT_TRAIL_SLUGS) {
    if (xml.includes(`discover-cyprus/${slug}/`)) slugs.add(slug);
  }
  return [...slugs].sort();
}

export function mergeTrailSlugs(...lists: string[][]): string[] {
  return [...new Set(lists.flat())].sort();
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  return res.text();
}

export async function fetchPostSitemapUrls(): Promise<string[]> {
  const indexXml = await fetchText(VC_SITEMAP_INDEX_URL);
  if (!indexXml) return [];
  const urls = [...indexXml.matchAll(/<loc>(https:\/\/www\.visitcyprus\.com\/post-sitemap[^<]*)<\/loc>/gi)].map(
    (m) => m[1],
  );
  return [...new Set(urls)];
}

export async function fetchSitemapTrailSlugs(): Promise<string[]> {
  const sitemapUrls = await fetchPostSitemapUrls();
  const slugs = new Set<string>();
  for (const url of sitemapUrls) {
    const xml = await fetchText(url);
    if (!xml) continue;
    for (const slug of extractSitemapTrailSlugs(xml)) slugs.add(slug);
    for (const slug of extractAltTrailSlugs(xml)) slugs.add(slug);
  }
  return [...slugs].sort();
}

export async function fetchIndexTrailSlugsLive(): Promise<string[]> {
  const html = await fetchText(VC_TRAILS_INDEX_URL);
  return html ? extractIndexTrailSlugs(html) : [];
}

export async function fetchVcTrailCatalog(): Promise<{
  indexSlugs: string[];
  sitemapSlugs: string[];
  slugs: string[];
}> {
  const [indexSlugs, sitemapSlugs] = await Promise.all([
    fetchIndexTrailSlugsLive(),
    fetchSitemapTrailSlugs(),
  ]);
  return {
    indexSlugs,
    sitemapSlugs,
    slugs: mergeTrailSlugs(indexSlugs, sitemapSlugs),
  };
}

async function main() {
  const { indexSlugs, sitemapSlugs, slugs } = await fetchVcTrailCatalog();
  const payload = {
    fetchedAt: new Date().toISOString(),
    indexUrl: VC_TRAILS_INDEX_URL,
    indexPageCount: 1,
    indexNote:
      "VC index uses client-side pagination (3 pages). Only page 1 HTML is fetched; sitemap fills gaps.",
    indexCount: indexSlugs.length,
    sitemapCount: sitemapSlugs.length,
    count: slugs.length,
    indexSlugs,
    sitemapSlugs,
    slugs,
  };
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Wrote ${slugs.length} slugs (${indexSlugs.length} index + ${sitemapSlugs.length} sitemap) → ${OUT}`,
  );
}

// Run only as a CLI entry — tests (and vc-trail-gap.ts) import from this module,
// and an import-time main() would refetch and rewrite the committed index.
const isCliEntry =
  typeof process.argv[1] === "string" && fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntry) {
  void main();
}
