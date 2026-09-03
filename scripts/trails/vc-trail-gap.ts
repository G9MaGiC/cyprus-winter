/**
 * Compare Visit Cyprus trail catalog vs slug map and app trail ids.
 *
 *   npm run trails:vc-gap              # live fetch
 *   npm run trails:vc-gap -- --offline # use scripts/trails/vc-trail-index.json
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trails } from "../../src/data/trails";
import { fetchVcTrailCatalog } from "./fetch-vc-trail-index";
import { VISITCYPRUS_ALT_TRAIL_SLUGS, VISITCYPRUS_SLUG_TO_TRAIL_ID } from "./visitcyprus-slug-map";

const here = dirname(fileURLToPath(import.meta.url));
const INDEX_JSON = join(here, "vc-trail-index.json");

export type VcTrailGapReport = {
  vcSlugCount: number;
  mappedSlugCount: number;
  appTrailCount: number;
  /** VC catalog slugs with no entry in visitcyprus-slug-map.ts */
  unmappedVcSlugs: string[];
  /** Slug-map keys absent from VC index + sitemap snapshot */
  mappedButMissingOnVc: string[];
  /** Slug map values that do not exist in src/data/trails.ts */
  invalidTrailIds: string[];
  /** Trail ids referenced by multiple VC slugs (expected for madari-ridge) */
  sharedTrailIds: Record<string, string[]>;
};

export function buildVcTrailGapReport(vcSlugs: string[]): VcTrailGapReport {
  const trailIds = new Set(trails.map((t) => t.id));
  const mappedSlugs = Object.keys(VISITCYPRUS_SLUG_TO_TRAIL_ID);
  const vcSet = new Set(vcSlugs);

  const unmappedVcSlugs = vcSlugs.filter((slug) => !(slug in VISITCYPRUS_SLUG_TO_TRAIL_ID));
  const mappedButMissingOnVc = mappedSlugs.filter((slug) => !vcSet.has(slug));

  const invalidTrailIds = [
    ...new Set(
      Object.values(VISITCYPRUS_SLUG_TO_TRAIL_ID).filter((id) => !trailIds.has(id)),
    ),
  ].sort();

  const byTrailId: Record<string, string[]> = {};
  for (const [slug, id] of Object.entries(VISITCYPRUS_SLUG_TO_TRAIL_ID)) {
    byTrailId[id] ??= [];
    byTrailId[id].push(slug);
  }
  const sharedTrailIds = Object.fromEntries(
    Object.entries(byTrailId)
      .filter(([, slugs]) => slugs.length > 1)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

  return {
    vcSlugCount: vcSlugs.length,
    mappedSlugCount: mappedSlugs.length,
    appTrailCount: trails.length,
    unmappedVcSlugs,
    mappedButMissingOnVc,
    invalidTrailIds,
    sharedTrailIds,
  };
}

function printReport(report: VcTrailGapReport) {
  console.log("Visit Cyprus trail gap report");
  console.log(`  VC slugs (index+sitemap): ${report.vcSlugCount}`);
  console.log(`  Slug map entries:         ${report.mappedSlugCount}`);
  console.log(`  App trails:               ${report.appTrailCount}`);
  if (report.unmappedVcSlugs.length) {
    console.log(`\nUnmapped VC slugs (${report.unmappedVcSlugs.length}):`);
    for (const slug of report.unmappedVcSlugs) console.log(`  - ${slug}`);
  } else {
    console.log("\nUnmapped VC slugs: none");
  }
  if (report.mappedButMissingOnVc.length) {
    console.log(`\nMapped but not on VC snapshot (${report.mappedButMissingOnVc.length}):`);
    for (const slug of report.mappedButMissingOnVc) console.log(`  - ${slug}`);
  }
  if (report.invalidTrailIds.length) {
    console.log(`\nInvalid trail ids in slug map (${report.invalidTrailIds.length}):`);
    for (const id of report.invalidTrailIds) console.log(`  - ${id}`);
  }
  const shared = Object.keys(report.sharedTrailIds);
  if (shared.length) {
    console.log(`\nShared trail ids (${shared.length}):`);
    for (const id of shared) {
      console.log(`  - ${id}: ${report.sharedTrailIds[id].join(", ")}`);
    }
  }
}

async function loadVcSlugs(offline: boolean): Promise<string[]> {
  if (offline) {
    const raw = JSON.parse(readFileSync(INDEX_JSON, "utf8")) as { slugs: string[] };
    return raw.slugs;
  }
  const catalog = await fetchVcTrailCatalog();
  return [...new Set([...catalog.slugs, ...VISITCYPRUS_ALT_TRAIL_SLUGS])].sort();
}

async function main() {
  const offline = process.argv.includes("--offline");
  const vcSlugs = await loadVcSlugs(offline);
  const report = buildVcTrailGapReport(vcSlugs);
  printReport(report);
  const failed =
    report.unmappedVcSlugs.length > 0 ||
    report.invalidTrailIds.length > 0;
  process.exit(failed ? 1 : 0);
}

// Run only as a CLI entry — the test imports buildVcTrailGapReport, and an
// import-time main() would fetch the network and process.exit() the test worker.
const isCliEntry =
  typeof process.argv[1] === "string" && fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntry) {
  void main();
}
