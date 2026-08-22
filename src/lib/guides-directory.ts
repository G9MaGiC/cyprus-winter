import {
  licensedGuides,
  type LicensedGuide,
} from "@/data/guides-directory";
import {
  LOCALE_TO_GUIDE_LANGUAGE,
  TRAIL_REGION_TO_DISTRICT,
  TOURIST_GUIDE_DISTRICTS,
  type TouristGuideDistrict,
} from "@/lib/guides-directory-types";

export type { LicensedGuide, TouristGuideDistrict };

export { LICENSED_GUIDES_PDF_URL, LICENSED_GUIDES_SOURCE } from "@/data/guides-directory";
export { TOURIST_GUIDE_DISTRICTS, LOCALE_TO_GUIDE_LANGUAGE, TRAIL_REGION_TO_DISTRICT };

/** Title-case guide names from PDF (often ALL CAPS). */
export function formatGuideName(name: string): string {
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export function districtForTrailRegion(region: string): TouristGuideDistrict | undefined {
  return TRAIL_REGION_TO_DISTRICT[region];
}

export function filterLicensedGuides(options: {
  district?: string | null;
  language?: string | null;
  query?: string | null;
}): LicensedGuide[] {
  const district =
    options.district && TOURIST_GUIDE_DISTRICTS.includes(options.district as TouristGuideDistrict)
      ? (options.district as TouristGuideDistrict)
      : null;
  const language = options.language?.trim().toLowerCase() || null;
  const q = options.query?.trim().toLowerCase() || null;

  return licensedGuides.filter((g) => {
    if (district && g.district !== district) return false;
    if (language && !g.languages.includes(language)) return false;
    if (q) {
      const hay = `${g.name} ${g.email} ${g.languages.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function commonGuideLanguages(): string[] {
  const counts = new Map<string, number>();
  for (const g of licensedGuides) {
    for (const lang of g.languages) {
      counts.set(lang, (counts.get(lang) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([lang]) => lang);
}

export function licensedGuideCount(): number {
  return licensedGuides.length;
}

/** Display labels for PDF language tokens (proper nouns; shared across locales). */
export const GUIDE_LANGUAGE_LABELS: Record<string, string> = {
  afrikaans: "Afrikaans",
  arabic: "Arabic",
  bulgarian: "Bulgarian",
  catalan: "Catalan",
  croatian: "Croatian",
  czech: "Czech",
  danish: "Danish",
  dutch: "Dutch",
  english: "English",
  finnish: "Finnish",
  french: "French",
  georgian: "Georgian",
  german: "German",
  greek: "Greek",
  hungarian: "Hungarian",
  italian: "Italian",
  polish: "Polish",
  romanian: "Romanian",
  russian: "Russian",
  serbian: "Serbian",
  slovak: "Slovak",
  spanish: "Spanish",
  swedish: "Swedish",
  turkish: "Turkish",
  ukrainian: "Ukrainian",
};

export function guideLanguageLabel(lang: string): string {
  return GUIDE_LANGUAGE_LABELS[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

export function districtGuideCount(district: TouristGuideDistrict): number {
  return licensedGuides.filter((g) => g.district === district).length;
}
