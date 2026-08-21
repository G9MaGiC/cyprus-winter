#!/usr/bin/env node
/**
 * Fail if unresolved git conflict markers are present in tracked source/docs.
 * Prevents BUG-222-style merges where rebase markers land on main.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MARKERS = ["<<<<<<<", "=======", ">>>>>>>"];
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  "android",
]);

const ROOTS = ["docs", "src", "messages", "scripts", ".github", "e2e"];

function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(md|ts|tsx|js|mjs|json|yml|yaml)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const hits = [];
for (const root of ROOTS) {
  for (const file of listFiles(path.join(ROOT, root))) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Exact conflict marker lines (allow ======= in markdown tables via leading | )
      if (
        line.startsWith("<<<<<<<") ||
        line.startsWith(">>>>>>>") ||
        line === "======="
      ) {
        hits.push(`${path.relative(ROOT, file)}:${i + 1}: ${line}`);
      }
    }
  }
}

if (hits.length) {
  console.error("Unresolved git conflict markers found:\n" + hits.join("\n"));
  process.exit(1);
}

console.log("check-conflict-markers: OK");
