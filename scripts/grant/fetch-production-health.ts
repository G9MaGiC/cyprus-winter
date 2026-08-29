/**
 * Capture public GET /api/health for the PRE-SEED annex.
 * Does not invent productionReady: true. Drops hints and env values.
 *
 *   GRANT_HEALTH_URL=https://cyprus-winter-three.vercel.app/api/health npm run grant:health
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAnnexHealthEvidence } from "../../src/lib/grant-health-evidence";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../docs/grant");
const defaultUrl = "https://cyprus-winter-three.vercel.app/api/health";
const url = (process.env.GRANT_HEALTH_URL || defaultUrl).replace(/\/$/, "");

async function main(): Promise<void> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const json: unknown = await res.json();
  const evidence = buildAnnexHealthEvidence({
    capturedAt: new Date(),
    url,
    httpStatus: res.status,
    json,
  });

  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, "production-health-public.json");
  await writeFile(outFile, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Wrote ${outFile}`);
  console.log(JSON.stringify(evidence.public));
  if (evidence.public.productionReady) {
    console.log("Live productionReady is true.");
  } else {
    console.log("Live productionReady is false. Do not paste a fabricated true into the annex.");
  }
}

void main();
