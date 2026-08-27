#!/usr/bin/env node
/**
 * Re-apply all beta chrome batch patches (2–17) in order.
 * Run: node scripts/i18n/patch-all-chrome-batches.mjs
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

for (let n = 2; n <= 17; n++) {
  const script = join(dir, `patch-locale-chrome-batch${n}.mjs`);
  execSync(`node ${script}`, { stdio: "inherit" });
}

console.log("All chrome batches 2–17 applied.");
