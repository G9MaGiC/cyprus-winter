/**
 * i18n hardcoded-string scanner.
 * Scans src for user-facing string literals that are not wrapped in t() / useTranslations.
 * Use to catch regressions when someone adds new copy without i18n.
 * Run: npm run i18n:scan [-- --fail] (--fail: exit 1 if any hardcoded strings found)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SRC_DIR = path.join(PROJECT_ROOT, "src");

const TRANSLATABLE_ATTRS = ["alt", "aria-label", "title", "placeholder"] as const;
const MIN_STRING_LENGTH = 3;
const MAX_REPORT = 100;

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
    } else if (e.name.endsWith(".tsx") && !full.includes(`${path.sep}contexts${path.sep}`)) {
      files.push(full);
    }
  }
  return files;
}

function stableId(s: string): string {
  return createHash("sha1").update(s).digest("hex").slice(0, 8);
}

/** Skip strings that are likely not user-facing. */
function isLikelyUserFacing(value: string, kind: "attr" | "text"): boolean {
  const v = value.trim();
  if (v.length < MIN_STRING_LENGTH) return false;
  if (/^[\d\s\-.,]+$/.test(v)) return false;
  if (/^[a-z][a-zA-Z0-9.]*$/.test(v) && v.length < 20 && !v.includes(" ")) return false; // e.g. className values
  if (v === "true" || v === "false" || v === "undefined" || v === "null") return false;
  if (v.startsWith("http") || v.startsWith("/") || v.startsWith(".")) return false;
  if (kind === "text" && (/&&|\|\||===|!==|>=|<=|=>|\?\s*:/.test(v) || /^\s*[=<>!]/.test(v))) return false; // code-like
  return true;
}

export interface HardcodedHit {
  file: string;
  line: number;
  kind: "attr" | "text";
  attr?: string;
  value: string;
  suggestedKey: string;
}

/** Find literal attr="value" or attr='value' that are translatable and not attr={t(...)}. */
function findLiteralAttrs(content: string, filePath: string): HardcodedHit[] {
  const hits: HardcodedHit[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    for (const attr of TRANSLATABLE_ATTRS) {
      // Skip if this line uses translation for this attr: attr={t("...")} or attr={tVar("...")}
      if (new RegExp(`${attr}=\\s*\\{\\s*[^}]*t\\(`).test(line)) continue;
      const re = new RegExp(`${attr}=["']([^"']+)["']`, "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const value = m[1].replace(/\\"/g, '"').trim();
        if (!isLikelyUserFacing(value, "attr")) continue;
        const suggestedKey = `common.${attr}.${stableId(value)}`;
        hits.push({ file: filePath, line: lineNum, kind: "attr", attr, value, suggestedKey });
      }
    }
  }
  return hits;
}

/** Find JSX text nodes that look like literal copy: >Some text< and not >{t(...)}<. */
function findLiteralText(content: string, filePath: string): HardcodedHit[] {
  const hits: HardcodedHit[] = [];
  if (!filePath.endsWith(".tsx")) return hits;
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    // Skip lines that are clearly JSX expressions only
    if (/^\s*\{[\s\S]*\}\s*$/.test(line)) continue;
    const re = />\s*([^<{][^<{]{3,}?)\s*</g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      const value = m[1].trim();
      // Avoid false positives like `>{t.rich(...)}<` which can look like text (`})}`) in a naive regex.
      if (value.includes("{") || value.includes("}")) continue;
      if (!isLikelyUserFacing(value, "text")) continue;
      if (value.includes("→") || value.includes("className") || /^\s*[\d.,\-]+\s*$/.test(value)) continue;
      const suggestedKey = `common.text.${stableId(value)}`;
      hits.push({ file: filePath, line: lineNum, kind: "text", value, suggestedKey });
    }
  }
  return hits;
}

function main(): void {
  const args = process.argv.slice(2);
  const failOnHit = args.includes("--fail");

  const files = walkDir(SRC_DIR);
  const allHits: HardcodedHit[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    allHits.push(...findLiteralAttrs(content, file));
    allHits.push(...findLiteralText(content, file));
  }

  const byFile = new Map<string, HardcodedHit[]>();
  for (const h of allHits) {
    const rel = path.relative(PROJECT_ROOT, h.file);
    if (!byFile.has(rel)) byFile.set(rel, []);
    byFile.get(rel)!.push(h);
  }

  if (allHits.length === 0) {
    console.log("i18n scan: no hardcoded user-facing strings found.");
    process.exit(0);
    return;
  }

  console.error(`i18n scan: ${allHits.length} possible hardcoded string(s) (use t() or useTranslations):`);
  let shown = 0;
  for (const [rel, hits] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const h of hits) {
      if (shown >= MAX_REPORT) {
        console.error(`  ... and ${allHits.length - MAX_REPORT} more. Run without --fail to see all.`);
        break;
      }
      const preview = h.value.length > 50 ? h.value.slice(0, 47) + "…" : h.value;
      const kind = h.kind === "attr" ? ` ${h.attr}=` : " text";
      console.error(`  ${rel}:${h.line}${kind} "${preview}" → suggest key: ${h.suggestedKey}`);
      shown++;
    }
    if (shown >= MAX_REPORT) break;
  }
  if (allHits.length > MAX_REPORT && shown >= MAX_REPORT) {
    console.error(`  ... and ${allHits.length - MAX_REPORT} more.`);
  }

  if (failOnHit) {
    console.error("Add these strings to messages and use t() or useTranslations(); re-run without --fail to list all.");
    process.exit(1);
  }
  process.exit(0);
}

main();
