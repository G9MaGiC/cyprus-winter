/**
 * Compare app trail catalog to authoritative Forestry / Visit Cyprus tiers.
 *
 *   npm run trails:state-forest-gap
 */
import { trails } from "../../src/data/trails";
import { classifyTrailImageSource } from "../../src/lib/cyprus-images";
import { buildCatalogSnapshot, tierForTrailId } from "./state-forest-catalog";

async function main(): Promise<void> {
  const snapshot = buildCatalogSnapshot();
  const appIds = trails.map((t) => t.id);
  const appSet = new Set(appIds);

  const missingFromApp = snapshot.authoritativeUnion.filter((id) => !appSet.has(id));
  const discoveryOnly = appIds.filter((id) => !snapshot.authoritativeUnion.includes(id));

  const tierCounts = { "visit-cyprus": 0, "fd56-outside": 0, "forestry-pdf": 0, discovery: 0 };
  for (const id of appIds) tierCounts[tierForTrailId(id, snapshot)] += 1;

  const officialHero = appIds.filter((id) => classifyTrailImageSource(id) === "official").length;

  console.log("=== State-forest / authoritative trail gap ===\n");
  console.log(`App catalog: ${appIds.length}`);
  console.log(`Visit Cyprus official (state forest / NFP): ${snapshot.visitCyprus.length}`);
  console.log(`Forestry fd56 outside state forest: ${snapshot.fd56Outside.length}`);
  console.log(`Forestry PDF leaflets (mapped): ${snapshot.forestryPdf.length}`);
  console.log(`Authoritative union (deduped): ${snapshot.authoritativeUnion.length}`);
  console.log(`Discovery / editorial only in app: ${discoveryOnly.length}`);
  console.log(`Official hero images: ${officialHero}\n`);

  console.log("App breakdown by tier:");
  console.log(`  Visit Cyprus: ${tierCounts["visit-cyprus"]}`);
  console.log(`  fd56 outside: ${tierCounts["fd56-outside"]}`);
  console.log(`  Forestry PDF: ${tierCounts["forestry-pdf"]}`);
  console.log(`  Discovery: ${tierCounts.discovery}\n`);

  if (missingFromApp.length) {
    console.log("Authoritative ids missing from app:");
    for (const id of missingFromApp) console.log(`  - ${id}`);
    console.log();
  } else {
    console.log("All authoritative ids present in app.\n");
  }

  if (snapshot.unmappedPdfKeys.length) {
    console.log("Unmapped Forestry PDF filenames:");
    for (const k of snapshot.unmappedPdfKeys) console.log(`  - ${k}`);
    console.log();
  }

  if (discoveryOnly.length) {
    console.log("Discovery-only trails (editorial, E4, variants — sample):");
    for (const id of discoveryOnly.slice(0, 20)) console.log(`  · ${id}`);
    if (discoveryOnly.length > 20) console.log(`  … and ${discoveryOnly.length - 20} more`);
    console.log();
  }

  console.log(
    "Mega map PDF (~158 MB): Nature Trails Akamas–Troodos–Kavo Gkreko — index not scraped (image-heavy; full download required).",
  );
  console.log("Historical guidebook count: 5 Akamas + 16 Troodos + 5 Cape Gkreko = 26 (subset of Visit Cyprus 31).");

  if (missingFromApp.length > 0) process.exitCode = 1;
}

void main();
