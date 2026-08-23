/**
 * Parse Visit Cyprus licensed tourist guides PDF → JSON for src/data/guides-directory.ts
 *
 *   npm run guides:parse-pdf
 *
 * Requires: poppler-utils (pdftotext), PDF at scripts/guides/TOURIST_GUIDES_AUG_2026_EN.pdf
 * or TOURIST_GUIDES_PDF_URL env.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PDF_DISTRICT_TO_ID, type TouristGuideDistrict } from "./tourist-guides-districts";

const here = dirname(fileURLToPath(import.meta.url));
const PDF_PATH = join(here, "TOURIST_GUIDES_AUG_2026_EN.pdf");
const PDF_URL =
  process.env.TOURIST_GUIDES_PDF_URL ??
  "https://www.visitcyprus.com/wp-content/uploads/2026/08/TOURIST_GUIDES_AUG.2026_EN.pdf";
const OUT_JSON = join(here, "guides-directory.json");
const OUT_TS = join(here, "../../src/data/guides-directory.ts");

const SKIP_LINES = new Set([
  "Tourist Guides List",
  "DEPUTY MINISTRY OF TOURISM",
  "NAME",
  "TELEPHONE",
  "LANGUAGES",
  "EMAIL",
]);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function isPageNoise(line: string): boolean {
  if (!line) return true;
  if (SKIP_LINES.has(line)) return true;
  if (/^Page:\s*\d+$/i.test(line)) return true;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(line)) return true;
  if (line.includes("\f")) return true;
  return false;
}

function isPhoneLine(line: string): boolean {
  return /^[\d\s,+()-]+$/.test(line) && /\d{5,}/.test(line);
}

function isLanguageLine(line: string): boolean {
  return /^[A-Z][A-Z,\s]+$/.test(line) && line.includes(",") && line.length > 3;
}

function normalizeLanguages(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

function ensurePdf(): string {
  try {
    readFileSync(PDF_PATH);
    return PDF_PATH;
  } catch {
    mkdirSync(here, { recursive: true });
    execSync(`curl -sL -o "${PDF_PATH}" "${PDF_URL}"`, { stdio: "inherit" });
    return PDF_PATH;
  }
}

function pdfToText(pdfPath: string): string {
  return execSync(`pdftotext "${pdfPath}" -`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
}

export type ParsedGuide = {
  id: string;
  name: string;
  district: TouristGuideDistrict;
  phones: string[];
  languages: string[];
  email: string;
};

export function parseGuidesFromText(text: string): ParsedGuide[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\f/g, "").trim())
    .filter((l) => !isPageNoise(l));

  let district: TouristGuideDistrict = "general";
  const entries: ParsedGuide[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line in PDF_DISTRICT_TO_ID) {
      district = PDF_DISTRICT_TO_ID[line];
      continue;
    }
    if (!/^\d+$/.test(line)) continue;

    i++;
    const nameParts: string[] = [];
    while (i < lines.length && !isPhoneLine(lines[i])) {
      if (lines[i] in PDF_DISTRICT_TO_ID) break;
      if (/^\d+$/.test(lines[i])) {
        i--;
        break;
      }
      nameParts.push(lines[i]);
      i++;
    }
    if (nameParts.length === 0) continue;

    const phoneParts: string[] = [];
    while (i < lines.length && isPhoneLine(lines[i])) {
      phoneParts.push(lines[i].replace(/\s+/g, " ").trim());
      i++;
    }
    if (i >= lines.length || !isLanguageLine(lines[i])) continue;
    const languages = normalizeLanguages(lines[i]);
    i++;

    if (i >= lines.length || !lines[i].includes("@")) continue;
    const email = lines[i].trim().toLowerCase();

    const name = nameParts.join(" ").replace(/\s+/g, " ").trim();
    const baseId = `${slugify(name)}-${district}`;
    let id = baseId;
    let n = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${n}`;
      n++;
    }
    seenIds.add(id);

    entries.push({
      id,
      name,
      district,
      phones: phoneParts.flatMap((p) => p.split(",").map((x) => x.trim())).filter(Boolean),
      languages,
      email,
    });
  }

  return entries;
}

function toTsModule(guides: ParsedGuide[], sourceVersion: string): string {
  return `/** Licensed tourist guides — auto-generated. Source: Visit Cyprus ${sourceVersion}. */
import type { TouristGuideDistrict } from "@/lib/guides-directory-types";

export type LicensedGuide = {
  id: string;
  name: string;
  district: TouristGuideDistrict;
  phones: string[];
  languages: string[];
  email: string;
};

export const LICENSED_GUIDES_SOURCE = ${JSON.stringify(sourceVersion)} as const;
export const LICENSED_GUIDES_PDF_URL =
  "https://www.visitcyprus.com/wp-content/uploads/2026/08/TOURIST_GUIDES_AUG.2026_EN.pdf" as const;

export const licensedGuides: LicensedGuide[] = ${JSON.stringify(guides, null, 2)};
`;
}

async function main(): Promise<void> {
  const pdfPath = ensurePdf();
  const text = pdfToText(pdfPath);
  const guides = parseGuidesFromText(text);
  const sourceVersion = "TOURIST_GUIDES_AUG.2026_EN.pdf";

  writeFileSync(OUT_JSON, JSON.stringify({ sourceVersion, count: guides.length, guides }, null, 2));
  writeFileSync(OUT_TS, toTsModule(guides, sourceVersion));

  const byDistrict = guides.reduce<Record<string, number>>((acc, g) => {
    acc[g.district] = (acc[g.district] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Parsed ${guides.length} licensed guides → ${OUT_TS}`);
  console.log("By district:", byDistrict);
  console.log("Checksum:", createHash("sha256").update(JSON.stringify(guides)).digest("hex").slice(0, 12));
}

const isCliEntry =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntry) {
  void main();
}
