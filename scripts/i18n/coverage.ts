/**
 * i18n coverage script.
 * - Collects all message keys from messages/en.json.
 * - Scans src for useTranslations/getTranslations and t("key") usage.
 * - Reports: unused keys (in messages but never referenced), missing keys (referenced but not in messages).
 * Run: npm run i18n:coverage [-- --strict] (--strict: exit 1 on unused keys)
 */
import * as fs from "node:fs";
import * as path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const MESSAGES_DIR = path.join(PROJECT_ROOT, "messages");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const EN_JSON = path.join(MESSAGES_DIR, "en.json");

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

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

function walkDir(dir: string, ext: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && !e.name.startsWith(".")) {
        files.push(...walkDir(full, ext));
      }
    } else if (ext.some((x) => e.name.endsWith(x))) {
      files.push(full);
    }
  }
  return files;
}

/** Map translation variable name -> namespace (empty string = full key in t()) */
function findNamespacesInFile(content: string): Map<string, string> {
  const map = new Map<string, string>();
  // const t = useTranslations("common") or const t = await getTranslations("common")
  const re1 = /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*["']([^"']*)["']\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re1.exec(content)) !== null) {
    map.set(m[1], m[2]);
  }
  // getTranslations({ locale, namespace: "weather.month" }) or getTranslations({ namespace: "nav" })
  const re2 = /const\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\s*\(\s*\{\s*[^}]*namespace\s*:\s*["']([^"']+)["']/g;
  while ((m = re2.exec(content)) !== null) {
    map.set(m[1], m[2]);
  }
  // const [tNav, tWeather, tCommon] = await Promise.all([ getTranslations("nav"), getTranslations("weather.page"), ... ])
  const promiseAllBlock = /const\s*\[\s*([\w\s,]+)\s*\]\s*=\s*await\s*Promise\.all\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/g;
  while ((m = promiseAllBlock.exec(content)) !== null) {
    const varNames = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const inner = m[2];
    const nsList: string[] = [];
    const reGetNs = /getTranslations\s*\(\s*["']([^"']*)["']\s*\)|getTranslations\s*\(\s*\{\s*[^}]*namespace\s*:\s*["']([^"']+)["']/g;
    let nm: RegExpExecArray | null;
    while ((nm = reGetNs.exec(inner)) !== null) {
      nsList.push(nm[1] !== undefined ? nm[1] : nm[2]);
    }
    for (let i = 0; i < varNames.length && i < nsList.length; i++) {
      map.set(varNames[i], nsList[i]);
    }
  }
  return map;
}

/** Find all tVar("key") or tVar('key') literal calls; returns full keys (namespace.key or key). */
function findUsedKeysInFile(content: string, namespaces: Map<string, string>): Set<string> {
  const used = new Set<string>();
  for (const [varName, ns] of namespaces) {
    // Match varName("key") or varName('key') - literal keys only
    const re = new RegExp(
      `\\b${escapeRegExp(varName)}\\s*\\(\\s*["']([^"']+)["']\\s*\\)`,
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const key = m[1];
      const fullKey = ns ? `${ns}.${key}` : key;
      used.add(fullKey);
    }
  }
  return used;
}

/** Find dynamic key prefixes like t(`options.status.${x}.desc`) -> options.status. */
function findDynamicKeyPrefixesInFile(
  content: string,
  namespaces: Map<string, string>
): Set<string> {
  const prefixes = new Set<string>();
  for (const [varName, ns] of namespaces) {
    // Match tVar(`prefix${...}`) to treat keys under prefix as possibly used
    const re = new RegExp(
      "\\b" + escapeRegExp(varName) + "\\s*\\(\\s*`([^`]*)\\$\\{",
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const prefix = m[1];
      const fullPrefix = ns ? `${ns}.${prefix}` : prefix;
      if (fullPrefix) prefixes.add(fullPrefix);
    }
  }
  return prefixes;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectUsedKeys(): { used: Set<string>; dynamicPrefixes: Set<string> } {
  const used = new Set<string>();
  const dynamicPrefixes = new Set<string>();
  const files = walkDir(SRC_DIR, [".tsx", ".ts"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const namespaces = findNamespacesInFile(content);
    if (namespaces.size === 0) continue;

    for (const k of findUsedKeysInFile(content, namespaces)) {
      used.add(k);
    }
    for (const p of findDynamicKeyPrefixesInFile(content, namespaces)) {
      dynamicPrefixes.add(p);
    }
  }

  return { used, dynamicPrefixes };
}

/** Keys that are under a dynamic prefix are considered "possibly used" (don't report as unused). */
function isUnderDynamicPrefix(key: string, prefixes: Set<string>): boolean {
  for (const p of prefixes) {
    if (key.startsWith(p)) return true;
  }
  return false;
}

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");

  if (!fs.existsSync(EN_JSON)) {
    console.error("Missing messages/en.json");
    process.exit(1);
  }

  const en = readJsonFile(EN_JSON);
  if (!isRecord(en)) {
    console.error("messages/en.json must be an object");
    process.exit(1);
  }

  const messageKeys = flattenKeys(en);
  const { used, dynamicPrefixes } = collectUsedKeys();

  const missing: string[] = [];
  for (const k of used) {
    if (!messageKeys.has(k)) missing.push(k);
  }
  missing.sort();

  const unused: string[] = [];
  for (const k of messageKeys) {
    if (used.has(k)) continue;
    if (isUnderDynamicPrefix(k, dynamicPrefixes)) continue;
    unused.push(k);
  }
  unused.sort();

  let exitCode = 0;

  if (missing.length > 0) {
    console.error(
      `i18n coverage: ${missing.length} key(s) used in code but missing from messages/en.json:`
    );
    missing.forEach((k) => console.error(`  - ${k}`));
    exitCode = 1;
  }

  if (unused.length > 0) {
    if (strict) {
      console.error(
        `i18n coverage: ${unused.length} key(s) in messages/en.json not referenced in src (use --strict to fail):`
      );
      unused.forEach((k) => console.error(`  - ${k}`));
      exitCode = 1;
    } else {
      console.log(
        `i18n coverage: ${unused.length} key(s) in messages/en.json not referenced (run with --strict to fail on unused):`
      );
      unused.slice(0, 20).forEach((k) => console.log(`  - ${k}`));
      if (unused.length > 20) {
        console.log(`  ... and ${unused.length - 20} more`);
      }
    }
  }

  if (exitCode === 0) {
    console.log(
      `i18n coverage OK: ${messageKeys.size} message keys, ${used.size} keys referenced in src`
    );
  }

  process.exit(exitCode);
}

main();
