/**
 * i18n coverage script.
 * - Collects all message keys from messages/en.json.
 * - Scans src for useTranslations/getTranslations and t("key") usage,
 *   including ternary bindings, t("key", { values }) calls, template-literal
 *   prefixes, registry-held `namespace:` config values, full-key string
 *   literals, and indirect consumption (t passed to a helper, or called with
 *   a variable key) — the last suppresses the WHOLE namespace, so an orphan
 *   inside a namespace that any file consumes indirectly (e.g. `common.*`)
 *   stays invisible; that residual blind spot is the price of a readable
 *   report (batch 67 took it from 2,131 reported unused keys to ~20).
 * - Reports: unused keys (in messages but never referenced), missing keys
 *   (referenced but not in messages).
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
  // Ternary binding — the content-overlay convention:
  //   const t = locale
  //     ? await getTranslations({ locale, namespace: "data.wineries" })
  //     : await getTranslations("data.wineries");
  // The initializer isn't a direct call, so re1/re2 miss it; accept anything
  // up to the first getTranslations within the statement.
  const re3 = /const\s+(\w+)\s*=\s*[^;=]*?getTranslations\s*\(\s*(?:["']([^"']*)["']|\{[^}]*namespace\s*:\s*["']([^"']+)["'])/g;
  while ((m = re3.exec(content)) !== null) {
    if (!map.has(m[1])) map.set(m[1], m[2] ?? m[3]);
  }
  // const [tNav, tWeather, tCommon] = await Promise.all([ getTranslations("nav"), ... ])
  const promiseAllBlock = /const\s*\[\s*([\w\s,]+)\s*\]\s*=\s*await\s*Promise\.all\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/g;
  while ((m = promiseAllBlock.exec(content)) !== null) {
    const varNames = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const elements = splitTopLevelComma(m[2]);
    const nsList: string[] = [];
    for (const el of elements) {
      const ns = extractNamespaceFromElement(el);
      if (ns !== null) nsList.push(ns);
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
    // Match varName("key") / varName('key'), with or without a values
    // object: t("key", { count }) is as literal a usage as t("key").
    const re = new RegExp(
      `\\b${escapeRegExp(varName)}\\s*\\(\\s*["']([^"']+)["']\\s*[,)]`,
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
    // Match tVar(`prefix${...}`) to treat keys under prefix as possibly
    // used. The capture must be lazy: a template that STARTS with an
    // interpolation (t(`${id}.${field}`), the overlay convention) has an
    // empty prefix, and a greedy capture would swallow up to the LAST ${
    // and produce a garbage prefix that matches nothing.
    const re = new RegExp(
      "\\b" + escapeRegExp(varName) + "\\s*\\(\\s*`([^`]*?)\\$\\{",
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

/**
 * Registry-held namespaces: `namespace: "beaches.page"` stored as config
 * (translated-page-meta.ts and friends) marks the whole namespace as
 * dynamically consumed. A `namespace:` that is the argument of a
 * getTranslations call is excluded — those bind a variable and keep precise
 * per-key tracking.
 */
function findRegistryNamespacePrefixes(content: string): Set<string> {
  const prefixes = new Set<string>();
  const re = /namespace\s*:\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const before = content.slice(Math.max(0, m.index - 80), m.index);
    if (/getTranslations\s*\(\s*\{[^}]*$/.test(before)) continue;
    prefixes.add(`${m[1]}.`);
  }
  return prefixes;
}

/**
 * Indirect consumption of a bound t: passed as a function argument
 * (tList(tAi, ...)) or called with a non-literal key (tRoutes(route.slug)).
 * Either way per-key tracking is impossible — treat the namespace as
 * dynamically consumed.
 */
function findIndirectNamespacePrefixes(
  content: string,
  namespaces: Map<string, string>
): Set<string> {
  const prefixes = new Set<string>();
  for (const [varName, ns] of namespaces) {
    if (!ns) continue;
    const identifierCall = new RegExp(
      `\\b${escapeRegExp(varName)}\\s*\\(\\s*[A-Za-z_$]`
    );
    const passedAsArg = new RegExp(
      `[,(]\\s*${escapeRegExp(varName)}\\s*[,)]`
    );
    if (identifierCall.test(content) || passedAsArg.test(content)) {
      prefixes.add(`${ns}.`);
    }
  }
  return prefixes;
}

/**
 * Full-key string literals: helpers like pwa-manifest's
 * nestedString(messages, "manifest.name") reference a key by its complete
 * dotted path without a bound t. Any quoted dotted path that exactly names
 * an existing message key counts as usage.
 */
function findFullKeyLiterals(content: string, messageKeys: Set<string>): Set<string> {
  const used = new Set<string>();
  const re = /["'`]([A-Za-z][\w-]*(?:\.[\w-]+)+)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (messageKeys.has(m[1])) used.add(m[1]);
  }
  return used;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split Promise.all array elements without breaking nested parens/brackets. */
function splitTopLevelComma(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) {
      parts.push(s.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(s.slice(start).trim());
  return parts.filter(Boolean);
}

/** One namespace per Promise.all element (handles ternary getTranslations calls). */
function extractNamespaceFromElement(element: string): string | null {
  const objMatch = element.match(
    /getTranslations\s*\(\s*\{[^}]*namespace\s*:\s*["']([^"']+)["']/
  );
  if (objMatch) return objMatch[1];
  const strMatch = element.match(/getTranslations\s*\(\s*["']([^"']*)["']\s*\)/);
  if (strMatch) return strMatch[1];
  return null;
}

function collectUsedKeys(messageKeys: Set<string>): {
  used: Set<string>;
  dynamicPrefixes: Set<string>;
} {
  const used = new Set<string>();
  const dynamicPrefixes = new Set<string>();
  const files = walkDir(SRC_DIR, [".tsx", ".ts"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const p of findRegistryNamespacePrefixes(content)) {
      dynamicPrefixes.add(p);
    }
    for (const k of findFullKeyLiterals(content, messageKeys)) {
      used.add(k);
    }
    const namespaces = findNamespacesInFile(content);
    if (namespaces.size === 0) continue;

    for (const k of findUsedKeysInFile(content, namespaces)) {
      used.add(k);
    }
    for (const p of findDynamicKeyPrefixesInFile(content, namespaces)) {
      dynamicPrefixes.add(p);
    }
    for (const p of findIndirectNamespacePrefixes(content, namespaces)) {
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
  const { used, dynamicPrefixes } = collectUsedKeys(messageKeys);

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
