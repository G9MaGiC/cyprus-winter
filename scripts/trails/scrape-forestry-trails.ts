/**
 * Scrape Forestry Department outside-forest trails (fd56) and leaflet PDF indexes.
 *
 *   npm run trails:scrape-forestry
 *
 * Writes scripts/trails/forestry-outside-manifest.json
 */
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { forestryNameToTrailId } from "./forestry-name-map";
import {
  extractPdfLinks,
  parseDurationMin,
  parseFd56OutsideTrails,
  parseLengthKm,
} from "./forestry-parse-utils";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, "forestry-outside-manifest.json");

const UA = "CyprusWinter/2.0 (forestry-trail-intake; +https://github.com/G9MaGiC/cyprus-winter)";

const FD56_URL = "https://www.moa.gov.cy/moa/fd/fd.nsf/fd56_en/fd56_en?OpenDocument";

const LEAFLET_INDEX_PAGES = [
  {
    district: "Troodos",
    url: "https://www.moa.gov.cy/moa/fd/fd.nsf/All/4DCA0BBDFF72749FC225812900264F88?OpenDocument",
  },
  {
    district: "Paphos",
    url: "https://www.moa.gov.cy/moa/fd/fd.nsf/All/8F336D01E3A7330FC225812900262F7F?OpenDocument",
  },
  {
    district: "Combined map",
    url: "https://www.moa.gov.cy/moa/fd/fd.nsf/All/4269544DF440E9D4C22583C10026422E?OpenDocument",
  },
] as const;

export type ForestryOutsideRecord = {
  num: number;
  name: string;
  region: string | null;
  routeType: string;
  start?: string;
  lengthRaw?: string;
  lengthKm: number | null;
  timeRaw?: string;
  durationMin: number | null;
  difficultyGrade?: string;
  pointsOfInterest?: string;
  note?: string;
  trailId: string | null;
  sourceUrl: string;
};

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

export async function scrapeForestryOutsideTrails(): Promise<{
  trails: ForestryOutsideRecord[];
  leaflets: { district: string; url: string; pdfs: string[] }[];
}> {
  const html = await fetchText(FD56_URL);
  const parsed = parseFd56OutsideTrails(html);

  const trails: ForestryOutsideRecord[] = parsed.map((t) => ({
    num: t.num,
    name: t.name,
    region: t.region,
    routeType: t.routeType,
    start: t.start,
    lengthRaw: t.length,
    lengthKm: parseLengthKm(t.length),
    timeRaw: t.time,
    durationMin: parseDurationMin(t.time),
    difficultyGrade: t.difficulty,
    pointsOfInterest: t.pointsOfInterest,
    note: t.note,
    trailId: forestryNameToTrailId(t.name),
    sourceUrl: FD56_URL,
  }));

  const leaflets: { district: string; url: string; pdfs: string[] }[] = [];
  for (const page of LEAFLET_INDEX_PAGES) {
    try {
      const pageHtml = await fetchText(page.url);
      leaflets.push({
        district: page.district,
        url: page.url,
        pdfs: extractPdfLinks(pageHtml, page.url),
      });
    } catch (err) {
      console.warn(`SKIP leaflets ${page.district}:`, err);
    }
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        source: "moa.gov.cy",
        page: FD56_URL,
        description: "Nature trails outside state forests (fd56_en)",
        license: "Cyprus Department of Forests — authoritative for route stats",
        fetchedAt: new Date().toISOString(),
        trailCount: trails.length,
        mappedCount: trails.filter((t) => t.trailId).length,
        leaflets,
        trails,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${manifestPath} (${trails.length} trails, ${trails.filter((t) => t.trailId).length} mapped)`);
  return { trails, leaflets };
}

async function main(): Promise<void> {
  await scrapeForestryOutsideTrails();
}

void main();
