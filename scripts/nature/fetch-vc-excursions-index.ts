/**
 * Fetch Visit Cyprus nature excursion slugs from index pages.
 *
 *   npm run nature:fetch-index
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VC_EXCURSIONS_INDEX_URL } from "../../src/lib/nature-excursion-types";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "vc-excursions-index.json");

const SLUG_RE =
  /href="https:\/\/www\.visitcyprus\.com\/discover-cyprus\/nature\/excursions\/([a-z0-9-]+)\/?"/gi;

export function extractExcursionSlugs(html: string): string[] {
  const slugs = new Set<string>();
  for (const match of html.matchAll(SLUG_RE)) {
    const slug = match[1];
    if (slug === "feed" || slug === "page") continue;
    slugs.add(slug);
  }
  return [...slugs].sort();
}

export async function fetchExcursionSlugs(maxPages = 3): Promise<string[]> {
  const slugs = new Set<string>();
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? VC_EXCURSIONS_INDEX_URL : `${VC_EXCURSIONS_INDEX_URL}?sf_paged=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "CyprusWinter-nature-intake/1.0" } });
    if (!res.ok) break;
    for (const slug of extractExcursionSlugs(await res.text())) slugs.add(slug);
  }
  return [...slugs].sort();
}

async function main() {
  const slugs = await fetchExcursionSlugs();
  writeFileSync(
    OUT,
    `${JSON.stringify({ fetchedAt: new Date().toISOString(), count: slugs.length, slugs }, null, 2)}\n`
  );
  console.log(`Wrote ${slugs.length} slugs to ${OUT}`);
}

void main();
