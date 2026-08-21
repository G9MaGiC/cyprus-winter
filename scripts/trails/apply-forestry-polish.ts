/**
 * Apply editorial polish from forestry-trail-copy.ts to src/data/trails.ts.
 *
 *   npm run trails:polish-forestry
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FORESTRY_TRAIL_COPY, type ForestryTrailCopy } from "./forestry-trail-copy";
import { FORESTRY_TRAILS_TO_ADD } from "./forestry-name-map";

const here = dirname(fileURLToPath(import.meta.url));
const trailsPath = join(here, "../../src/data/trails.ts");

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patchTrailBlock(source: string, id: string, copy: ForestryTrailCopy): string {
  const idPat = escapeForRegex(id);
  const blockRe = new RegExp(`(id: "${idPat}"[\\s\\S]*?)(\\n  \\},)`, "m");
  const match = source.match(blockRe);
  if (!match) throw new Error(`Trail block not found: ${id}`);

  let block = match[1];
  block = block.replace(
    /description:[\s\S]*?(?=\n\s*highlights:)/,
    `description:\n      ${JSON.stringify(copy.description)}`,
  );
  block = block.replace(/highlights: \[[^\]]*\]/, `highlights: ${JSON.stringify(copy.highlights)}`);
  block = block.replace(/localSecret: "[^"]*"/, `localSecret: ${JSON.stringify(copy.localSecret)}`);
  if (copy.winterNotes) {
    block = block.replace(/winterNotes: "[^"]*"/, `winterNotes: ${JSON.stringify(copy.winterNotes)}`);
  }
  if (copy.topSights) {
    if (/topSights:/.test(block)) {
      block = block.replace(/topSights: \[[^\]]*\],?/, `topSights: ${JSON.stringify(copy.topSights)},`);
    } else {
      block = block.replace(
        /(localSecret: [^\n]+)\n/,
        `$1,\n    topSights: ${JSON.stringify(copy.topSights)},\n`,
      );
    }
  }

  return source.replace(blockRe, `${block}$2`);
}

async function main(): Promise<void> {
  let source = await readFile(trailsPath, "utf8");
  let patched = 0;

  for (const id of FORESTRY_TRAILS_TO_ADD) {
    const copy = FORESTRY_TRAIL_COPY[id];
    if (!copy) {
      console.warn(`SKIP ${id}: no copy in forestry-trail-copy.ts`);
      continue;
    }
    source = patchTrailBlock(source, id, copy);
    patched++;
    console.log(`OK ${id}`);
  }

  await writeFile(trailsPath, source);
  console.log(`Patched ${patched} trails in ${trailsPath}`);
}

void main();
