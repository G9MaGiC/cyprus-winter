import { guides, type Guide } from "@/data/guides";
import { licensedGuides } from "@/data/guides-directory";
import { LOCALE_TO_GUIDE_LANGUAGE } from "@/lib/guides-directory-types";

export function guideSpeaksLocale(guide: Guide, locale: string): boolean {
  const lang = LOCALE_TO_GUIDE_LANGUAGE[locale];
  if (!lang) return true;
  return guide.languages.includes(lang);
}

/** Prefer verified partners who speak the visitor's locale. */
export function sortGuidesByLocaleMatch(guideList: Guide[], locale?: string | null): Guide[] {
  if (!locale) return guideList;
  return [...guideList].sort((a, b) => {
    const aMatch = guideSpeaksLocale(a, locale) ? 0 : 1;
    const bMatch = guideSpeaksLocale(b, locale) ? 0 : 1;
    return aMatch - bMatch;
  });
}

export function getVerifiedPartnerForLicensedId(licensedId: string): Guide | undefined {
  return guides.find((g) => g.isVerified && g.licensedGuideId === licensedId);
}

export function getLicensedGuideForPartner(guide: Guide) {
  if (!guide.licensedGuideId) return undefined;
  return licensedGuides.find((g) => g.id === guide.licensedGuideId);
}

export function verifiedPartnersByDistrict(district: Guide["district"]): Guide[] {
  return guides.filter((g) => g.isVerified && g.district === district);
}
