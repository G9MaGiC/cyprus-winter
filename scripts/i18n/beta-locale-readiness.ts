/**
 * Report beta-locale graduation readiness (fr/he/ro).
 * Does not replace lawyer review — see docs/BETA_LOCALE_GRADUATION.md
 *
 * Run: npm run i18n:beta-readiness
 */
import * as fs from "node:fs";
import * as path from "node:path";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

function flatten(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, key, out);
      continue;
    }
    if (typeof v === "string") out[key] = v;
  }
  return out;
}

function readBetaLocales(): string[] {
  const src = fs.readFileSync(path.join(PROJECT_ROOT, "src/i18n/routing.ts"), "utf8");
  const match = src.match(/export const BETA_LOCALES\s*=\s*\[([^\]]*)\]/);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

const INTENTIONAL =
  /openStreetMap|Cyprus Winter|placeholder|instagramCta|ogNamedTitle|unknownPlace|summarySeparator|temperature|descriptionPrefix|popupMeta|editorsPicks\.items\..*\.title|featuredWineries\.items\..*\.title|planQuick\.quickAddPlaces|wineRoutes\.routeNames|footer\.(troodos|paphos)|onboarding\.welcome|^home\.title$|auth\.social\.providers|birdLife|images\.unoptimized|winterTip\.icon|jsonLd\.priceRange|footer\.suffix|finePrint\.bodySuffix|Google|Apple|Troodos|Paphos|Kourion|Omodos|Krasochoria|Laona|Akamas|Commandaria/i;

const en = flatten(
  JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "messages/en.json"), "utf8")) as Record<
    string,
    unknown
  >
);

const betaLocales = readBetaLocales();

console.log("BETA_LOCALES:", betaLocales.join(", ") || "(empty — graduated)");
console.log("");

for (const loc of ["fr", "he", "ro"] as const) {
  const msg = flatten(
    JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, `messages/${loc}.json`), "utf8")) as Record<
      string,
      unknown
    >
  );
  let legalEn = 0;
  let adminEn = 0;
  let holdoutish = 0;
  let otherEn = 0;
  for (const [k, v] of Object.entries(en)) {
    if (!v || msg[k] !== v) continue;
    if (k.startsWith("privacy.") || k.startsWith("terms.")) legalEn++;
    else if (k.startsWith("admin.")) adminEn++;
    else if (INTENTIONAL.test(k) || INTENTIONAL.test(v)) holdoutish++;
    else otherEn++;
  }
  console.log(`${loc}:`);
  console.log(`  privacy/terms still === EN: ${legalEn} (expect 0 after BUG-334)`);
  console.log(`  admin EN-identical: ${adminEn}`);
  console.log(`  intentional holdout-like: ~${holdoutish}`);
  console.log(`  other EN-identical (cognates/review): ${otherEn}`);
}

console.log("");
if (betaLocales.length > 0) {
  console.log("Graduation: BLOCKED until lawyer sign-off + empty BETA_LOCALES.");
  console.log("See docs/BETA_LOCALE_GRADUATION.md");
} else {
  console.log("Graduation: BETA_LOCALES empty — confirm docs/checklist + CI.");
}
