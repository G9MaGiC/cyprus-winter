/**
 * Validate app catalog against the 68 authoritative trail ids and VC slug map.
 *
 *   npm run trails:hiking-map-validate
 *
 * Does not download the Forestry mega map PDF (~158 MB). Compares src/data/trails.ts
 * to the committed authoritative union from Visit Cyprus + Forestry tiers.
 */
import { fileURLToPath } from "node:url";
import { trails } from "../../src/data/trails";
import {
  AUTHORITATIVE_TRAIL_ID_COUNT,
  AUTHORITATIVE_TRAIL_IDS,
  FORESTRY_MEGA_MAP_PDF_URL,
  MEGA_MAP_HISTORICAL_ROUTE_COUNT,
} from "./authoritative-trail-ids";
import { VISITCYPRUS_SLUG_TO_TRAIL_ID } from "./visitcyprus-slug-map";

export type HikingMapValidationReport = {
  authoritativeCount: number;
  appTrailCount: number;
  authoritativePresent: string[];
  authoritativeMissing: string[];
  vcSlugMapCount: number;
  vcMappedInAuthoritative: string[];
  vcMappedNotAuthoritative: string[];
  discoveryOnlyCount: number;
};

export function buildHikingMapValidationReport(): HikingMapValidationReport {
  const appIds = trails.map((t) => t.id);
  const appSet = new Set(appIds);
  const authSet = new Set<string>(AUTHORITATIVE_TRAIL_IDS);

  const authoritativePresent = AUTHORITATIVE_TRAIL_IDS.filter((id) => appSet.has(id));
  const authoritativeMissing = AUTHORITATIVE_TRAIL_IDS.filter((id) => !appSet.has(id));

  const vcMappedIds = [...new Set(Object.values(VISITCYPRUS_SLUG_TO_TRAIL_ID))];
  const vcMappedInAuthoritative = vcMappedIds.filter((id) => authSet.has(id));
  const vcMappedNotAuthoritative = vcMappedIds.filter((id) => !authSet.has(id));

  const discoveryOnlyCount = appIds.filter((id) => !authSet.has(id)).length;

  return {
    authoritativeCount: AUTHORITATIVE_TRAIL_IDS.length,
    appTrailCount: appIds.length,
    authoritativePresent,
    authoritativeMissing,
    vcSlugMapCount: vcMappedIds.length,
    vcMappedInAuthoritative,
    vcMappedNotAuthoritative,
    discoveryOnlyCount,
  };
}

function printReport(report: HikingMapValidationReport) {
  console.log("=== Authoritative trail catalog validation ===\n");
  console.log(`Authoritative union: ${report.authoritativeCount} (expected ${AUTHORITATIVE_TRAIL_ID_COUNT})`);
  console.log(`App catalog: ${report.appTrailCount}`);
  console.log(`Authoritative in app: ${report.authoritativePresent.length}`);
  console.log(`Authoritative missing: ${report.authoritativeMissing.length}`);
  console.log(`Discovery / editorial only: ${report.discoveryOnlyCount}`);
  console.log(`VC slug map trail ids: ${report.vcSlugMapCount}\n`);

  if (report.authoritativeMissing.length) {
    console.log("Missing authoritative ids:");
    for (const id of report.authoritativeMissing) console.log(`  - ${id}`);
    console.log();
  } else {
    console.log("All authoritative ids present in app.\n");
  }

  if (report.vcMappedNotAuthoritative.length) {
    console.log("VC slug map ids not in authoritative union:");
    for (const id of report.vcMappedNotAuthoritative) console.log(`  - ${id}`);
    console.log();
  }

  console.log("Mega map PDF (deferred — not scraped):");
  console.log(`  ${FORESTRY_MEGA_MAP_PDF_URL}`);
  console.log(
    `  Historical guidebook: ${MEGA_MAP_HISTORICAL_ROUTE_COUNT} routes (5 Akamas + 16 Troodos + 5 Cape Gkreko)`,
  );
}

async function main() {
  const strict = process.argv.includes("--strict");
  const report = buildHikingMapValidationReport();
  printReport(report);

  const failed =
    report.authoritativeCount !== AUTHORITATIVE_TRAIL_ID_COUNT ||
    report.authoritativeMissing.length > 0 ||
    report.vcMappedNotAuthoritative.length > 0;

  if (failed && strict) process.exit(1);
}

// Run only as a CLI entry — tests import buildHikingMapValidationReport, and an
// import-time main() would print the full report into every vitest run.
const isCliEntry =
  typeof process.argv[1] === "string" && fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntry) {
  void main();
}
