/**
 * i18n coverage script.
 * - Collects all message keys from messages/en.json.
 * - Scans src for useTranslations/getTranslations and t("key") usage,
 *   including ternary bindings, t("key", { values }) calls, t.rich/t.raw/
 *   t.markup calls, template-literal prefixes, registry-held `namespace:`
 *   config values, full-key string literals, and indirect consumption
 *   (t passed to a helper, or called with a variable key) — the last
 *   suppresses the WHOLE namespace, so an orphan inside a namespace that any
 *   file consumes indirectly (e.g. `common.*`) stays invisible; the script
 *   reports how many keys sit under that exemption so the blind spot is
 *   measured, not silent (batch 67 took the report from 2,131 reported
 *   unused keys to ~20; batch 72 made binding resolution position-aware).
 * - A variable can be re-bound to different namespaces within one file
 *   (locale-metadata-dynamic.ts binds `t` four times); every use resolves to
 *   the nearest preceding binding, not the file's last one.
 * - Reports: unused keys (in messages but never referenced), missing keys
 *   (referenced but not in messages).
 * Run: npm run i18n:coverage [-- --strict] (--strict: exit 1 on unused keys)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../..");
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

export function flattenKeys(
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

/**
 * Only application sources count as consumption. A test fixture quoting a
 * catalog-shaped key would otherwise keep a production-dead key alive in
 * the strict gate (PR #236 review finding; same exclusion the extract walk
 * gained in batch 76).
 */
export function isScannedSourceFile(name: string): boolean {
  return (
    (name.endsWith(".ts") || name.endsWith(".tsx")) &&
    !name.endsWith(".test.ts") &&
    !name.endsWith(".test.tsx")
  );
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && !e.name.startsWith(".")) {
        files.push(...walkDir(full));
      }
    } else if (isScannedSourceFile(e.name)) {
      files.push(full);
    }
  }
  return files;
}

/** One namespace binding of a translation variable, at a position in the file. */
export type NamespaceBinding = { ns: string; index: number };
export type BindingMap = Map<string, NamespaceBinding[]>;

/**
 * Map translation variable name -> its bindings in source order (empty
 * namespace string = full key in t()). A name bound more than once — four
 * `const t = await getTranslations(...)` in locale-metadata-dynamic.ts — gets
 * one entry per binding; uses resolve to the nearest preceding one.
 */
export function findNamespaceBindingsInFile(content: string): BindingMap {
  const map: BindingMap = new Map();
  const add = (varName: string, ns: string, index: number) => {
    const list = map.get(varName) ?? [];
    if (list.some((b) => b.index === index)) return;
    list.push({ ns, index });
    map.set(varName, list);
  };
  // const t = useTranslations("common") or const t = await getTranslations("common")
  const re1 = /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*["']([^"']*)["']\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re1.exec(content)) !== null) {
    add(m[1], m[2], m.index);
  }
  // getTranslations({ locale, namespace: "weather.month" }) or getTranslations({ namespace: "nav" })
  const re2 = /const\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\s*\(\s*\{\s*[^}]*namespace\s*:\s*["']([^"']+)["']/g;
  while ((m = re2.exec(content)) !== null) {
    add(m[1], m[2], m.index);
  }
  // Ternary binding — the content-overlay convention:
  //   const t = locale
  //     ? await getTranslations({ locale, namespace: "data.wineries" })
  //     : await getTranslations("data.wineries");
  // The initializer isn't a direct call, so re1/re2 miss it; accept anything
  // up to the first getTranslations within the statement. add() dedupes the
  // statements re1/re2 already claimed (same variable at the same index).
  const re3 = /const\s+(\w+)\s*=\s*[^;=]*?getTranslations\s*\(\s*(?:["']([^"']*)["']|\{[^}]*namespace\s*:\s*["']([^"']+)["'])/g;
  while ((m = re3.exec(content)) !== null) {
    add(m[1], m[2] ?? m[3], m.index);
  }
  // const [tNav, tWeather, tCommon] = await Promise.all([ getTranslations("nav"), ... ])
  const promiseAllBlock = /const\s*\[\s*([\w\s,]+)\s*\]\s*=\s*await\s*Promise\.all\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/g;
  while ((m = promiseAllBlock.exec(content)) !== null) {
    const varNames = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    const elements = splitTopLevelComma(m[2]);
    // Keep positional alignment: a Promise.all can mix getTranslations with
    // other awaits (e.g. [data, tHome, tCommon]) — filtering the nulls would
    // shift every later variable onto the wrong namespace.
    for (let i = 0; i < varNames.length && i < elements.length; i++) {
      const ns = extractNamespaceFromElement(elements[i]);
      if (ns !== null) add(varNames[i], ns, m.index);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.index - b.index);
  }
  return map;
}

/** The namespace in force at useIndex: nearest preceding binding (first one if none precede). */
export function resolveNamespaceAt(
  bindings: NamespaceBinding[],
  useIndex: number
): string {
  let ns = bindings[0].ns;
  for (const b of bindings) {
    if (b.index <= useIndex) ns = b.ns;
    else break;
  }
  return ns;
}

// t.rich("key", …), t.raw("key") and t.markup("key", …) are as literal a
// usage as t("key") — next-intl's non-call accessors.
const RICH_ACCESSOR = "(?:\\.(?:rich|raw|markup))?";

/** Find all tVar("key") or tVar('key') literal calls; returns full keys (namespace.key or key). */
export function findUsedKeysInFile(content: string, bindings: BindingMap): Set<string> {
  const used = new Set<string>();
  for (const [varName, list] of bindings) {
    // Match varName("key") / varName('key'), with or without a values
    // object: t("key", { count }) is as literal a usage as t("key").
    const re = new RegExp(
      `\\b${escapeRegExp(varName)}${RICH_ACCESSOR}\\s*\\(\\s*["']([^"']+)["']\\s*[,)]`,
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const ns = resolveNamespaceAt(list, m.index);
      const key = m[1];
      used.add(ns ? `${ns}.${key}` : key);
    }
  }
  return used;
}

/** Find dynamic key prefixes like t(`options.status.${x}.desc`) -> options.status. */
export function findDynamicKeyPrefixesInFile(
  content: string,
  bindings: BindingMap
): Set<string> {
  const prefixes = new Set<string>();
  for (const [varName, list] of bindings) {
    // Match tVar(`prefix${...}`) to treat keys under prefix as possibly
    // used. The capture must be lazy: a template that STARTS with an
    // interpolation (t(`${id}.${field}`), the overlay convention) has an
    // empty prefix, and a greedy capture would swallow up to the LAST ${
    // and produce a garbage prefix that matches nothing.
    const re = new RegExp(
      "\\b" + escapeRegExp(varName) + RICH_ACCESSOR + "\\s*\\(\\s*`([^`]*?)\\$\\{",
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const ns = resolveNamespaceAt(list, m.index);
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
export function findRegistryNamespacePrefixes(content: string): Set<string> {
  const prefixes = new Set<string>();
  // A `namespace:` may be a TS union type (`namespace: "a" | "b"`) — every
  // alternative is a possible runtime namespace, so register them all.
  const re = /namespace\s*:\s*["']([^"']+)["']((?:\s*\|\s*["'][^"']+["'])*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const before = content.slice(Math.max(0, m.index - 80), m.index);
    if (/getTranslations\s*\(\s*\{[^}]*$/.test(before)) continue;
    prefixes.add(`${m[1]}.`);
    const unionRe = /["']([^"']+)["']/g;
    let u: RegExpExecArray | null;
    while ((u = unionRe.exec(m[2] ?? "")) !== null) {
      prefixes.add(`${u[1]}.`);
    }
  }
  return prefixes;
}

/**
 * Indirect consumption of a bound t: passed as a function argument
 * (tList(tAi, ...)) or called with a non-literal key (tRoutes(route.slug)).
 * Either way per-key tracking is impossible — treat the namespace as
 * dynamically consumed. An arrow-function PARAMETER that shares the
 * variable's name (`items.find((t) => …)`) is not consumption: without the
 * `=>` check, renaming any bound variable to `t` in a file with such an
 * arrow would silently exempt the whole namespace from the strict gate.
 */
export function findIndirectNamespacePrefixes(
  content: string,
  bindings: BindingMap
): Set<string> {
  const prefixes = new Set<string>();
  for (const [varName, list] of bindings) {
    const identifierCall = new RegExp(
      `\\b${escapeRegExp(varName)}${RICH_ACCESSOR}\\s*\\(\\s*[A-Za-z_$]`,
      "g"
    );
    let m: RegExpExecArray | null;
    while ((m = identifierCall.exec(content)) !== null) {
      const ns = resolveNamespaceAt(list, m.index);
      if (ns) prefixes.add(`${ns}.`);
    }
    const passedAsArg = new RegExp(
      `[,(]\\s*${escapeRegExp(varName)}\\s*[,)]`,
      "g"
    );
    while ((m = passedAsArg.exec(content)) !== null) {
      if (/^\s*=>/.test(content.slice(m.index + m[0].length))) continue;
      const ns = resolveNamespaceAt(list, m.index);
      if (ns) prefixes.add(`${ns}.`);
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
export function findFullKeyLiterals(content: string, messageKeys: Set<string>): Set<string> {
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
  const files = walkDir(SRC_DIR);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const p of findRegistryNamespacePrefixes(content)) {
      dynamicPrefixes.add(p);
    }
    for (const k of findFullKeyLiterals(content, messageKeys)) {
      used.add(k);
    }
    const bindings = findNamespaceBindingsInFile(content);
    if (bindings.size === 0) continue;

    for (const k of findUsedKeysInFile(content, bindings)) {
      used.add(k);
    }
    for (const p of findDynamicKeyPrefixesInFile(content, bindings)) {
      dynamicPrefixes.add(p);
    }
    for (const p of findIndirectNamespacePrefixes(content, bindings)) {
      dynamicPrefixes.add(p);
    }
  }

  return { used, dynamicPrefixes };
}

/** Keys that are under a dynamic prefix are considered "possibly used" (don't report as unused). */
export function isUnderDynamicPrefix(key: string, prefixes: Set<string>): boolean {
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

  // The exemption is a measured blind spot, not a silent one: keys under a
  // dynamic/indirect prefix can never be flagged unused, so say how many.
  let shielded = 0;
  for (const k of messageKeys) {
    if (!used.has(k) && isUnderDynamicPrefix(k, dynamicPrefixes)) shielded++;
  }
  console.log(
    `i18n coverage: ${shielded} key(s) under ${dynamicPrefixes.size} dynamic/indirect prefixes are exempt from per-key tracking`
  );

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
        `i18n coverage: ${unused.length} key(s) in messages/en.json not referenced in src:`
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

const isMain =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
