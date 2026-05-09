import * as fs from "node:fs";
import * as path from "node:path";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const MESSAGES_DIR = path.join(PROJECT_ROOT, "messages");

const LOCALES = ["en", "de", "el", "pl"] as const;
type Locale = (typeof LOCALES)[number];

function readJsonFile(p: string): Json {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as Json;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
  out = new Set<string>()
): Set<string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isRecord(v)) {
      flattenKeys(v, key, out);
      continue;
    }
    out.add(key);
  }
  return out;
}

function collectEmptyStringKeys(
  obj: Record<string, unknown>,
  prefix = "",
  out: string[] = []
): string[] {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isRecord(v)) {
      collectEmptyStringKeys(v, key, out);
      continue;
    }
    if (typeof v === "string" && v.trim().length === 0) {
      out.push(key);
    }
  }
  return out;
}

function diffSets(a: Set<string>, b: Set<string>): { onlyInA: string[]; onlyInB: string[] } {
  const onlyInA: string[] = [];
  const onlyInB: string[] = [];
  for (const k of a) if (!b.has(k)) onlyInA.push(k);
  for (const k of b) if (!a.has(k)) onlyInB.push(k);
  onlyInA.sort();
  onlyInB.sort();
  return { onlyInA, onlyInB };
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function main(): void {
  const messages: Record<Locale, Record<string, unknown>> = {} as never;

  for (const locale of LOCALES) {
    const p = path.join(MESSAGES_DIR, `${locale}.json`);
    if (!fs.existsSync(p)) fail(`Missing messages file: ${p}`);
    const json = readJsonFile(p);
    if (!isRecord(json)) fail(`Messages file must be an object: ${p}`);
    messages[locale] = json;
  }

  const baseLocale: Locale = "en";
  const baseKeys = flattenKeys(messages[baseLocale]);
  const baseEmpty = collectEmptyStringKeys(messages[baseLocale]);
  if (baseEmpty.length > 0) {
    fail(
      `Empty message values in ${baseLocale}.json:\n` +
        baseEmpty.map((k) => `- ${k}`).join("\n")
    );
  }

  let hadMismatch = false;
  for (const locale of LOCALES) {
    const keys = flattenKeys(messages[locale]);
    const empty = collectEmptyStringKeys(messages[locale]);
    if (empty.length > 0) {
      hadMismatch = true;
      console.error(
        `Empty message values in ${locale}.json:\n` + empty.map((k) => `- ${k}`).join("\n")
      );
    }

    if (locale === baseLocale) continue;
    const { onlyInA: onlyInBase, onlyInB: onlyInLocale } = diffSets(baseKeys, keys);
    if (onlyInBase.length || onlyInLocale.length) {
      hadMismatch = true;
      console.error(`Key mismatch: ${locale}.json vs ${baseLocale}.json`);
      if (onlyInBase.length) {
        console.error(`- Missing in ${locale}.json (${onlyInBase.length}):\n${onlyInBase.map((k) => `  - ${k}`).join("\n")}`);
      }
      if (onlyInLocale.length) {
        console.error(`- Extra in ${locale}.json (${onlyInLocale.length}):\n${onlyInLocale.map((k) => `  - ${k}`).join("\n")}`);
      }
    }
  }

  if (hadMismatch) process.exit(1);
  console.log(
    `i18n messages validated: ${LOCALES.length} locales, ${baseKeys.size} keys (base: ${baseLocale})`
  );
}

main();
