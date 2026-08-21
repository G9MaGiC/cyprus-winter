/**
 * Fetch Visit Cyprus cycling route slugs from index pages (maintenance script).
 *
 *   npm run cycling:fetch-index
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VC_CYCLING_INDEX_URL } from "../../src/lib/cycling-route-types";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "vc-cycling-index.json");

const ROUTE_PATH_RE =
  /href="https:\/\/www\.visitcyprus\.com\/discover-cyprus\/nature\/cycling\/([a-z0-9-]+)\/?"/gi;

export function extractCyclingSlugs(html: string): string[] {
  const slugs = new Set<string>();
  for (const match of html.matchAll(ROUTE_PATH_RE)) {
    const slug = match[1];
    if (slug === "feed" || slug === "page") continue;
    slugs.add(slug);
  }
  return [...slugs].sort();
}

export async function fetchIndexSlugs(maxPages = 7): Promise<string[]> {
  const slugs = new Set<string>();
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? VC_CYCLING_INDEX_URL : `${VC_CYCLING_INDEX_URL}?sf_paged=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "CyprusWinter-cycling-intake/1.0" } });
    if (!res.ok) break;
    const html = await res.text();
    for (const slug of extractCyclingSlugs(html)) slugs.add(slug);
  }
  return [...slugs].sort();
}

async function main() {
  const slugs = await fetchIndexSlugs();
  const payload = {
    fetchedAt: new Date().toISOString(),
    indexUrl: VC_CYCLING_INDEX_URL,
    count: slugs.length,
    slugs,
  };
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${slugs.length} slugs to ${OUT}`);
}

void main();
