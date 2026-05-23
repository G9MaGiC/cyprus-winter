/**
 * Personalization scoring for Discover items and Plan templates.
 * Maps user preferences (interests, traveler type) to content relevance.
 */

import type { Interest, TravelerType } from "./user-preferences";

type DiscoverItem = {
  id: string;
  type: string;
  bestFor?: string[];
  region?: string;
};

type ItineraryTemplate = {
  key: string;
  label: string;
  bestFor: string[];
  duration: number;
};

/** Keywords per interest — items matching these score higher. */
const INTEREST_KEYWORDS: Record<Interest, string[]> = {
  active: ["hiking", "trail", "trails", "active", "walk", "mountain", "outdoor"],
  bouldering: ["boulder", "bouldering", "climbing wall", "rock gym"],
  climbing: ["climbing", "crag", "rock", "cliff", "via ferrata", "rope"],
  cycling: ["cycling", "bike", "bicycle", "mountain bike", "mtb", "cycle"],
  culture: ["history", "archaeology", "culture", "museum", "ancient", "unesco", "byzantine", "heritage"],
  wine: ["wine", "tasting", "winery", "commandaria", "krasochoria", "grape"],
  wellness: ["wellness", "relaxation", "peaceful", "quiet", "spa", "retreat"],
  villages: ["village", "villages", "omodos", "lefkara", "kakopetria", "traditional", "stone"],
};

/** Attraction types that map to interests. */
const TYPE_TO_INTEREST: Record<string, Interest[]> = {
  beach: ["wellness"],
  nature: ["active", "bouldering", "climbing", "cycling", "wellness"],
  activity: ["bouldering", "climbing", "active"],
  ancient: ["culture"],
  village: ["villages", "culture"],
  monastery: ["culture"],
  winery: ["wine"],
};

/** bestFor labels that map to interests (case-insensitive partial match). */
function bestForMatchesInterest(bestFor: string[] | undefined, interest: Interest): boolean {
  if (!bestFor?.length) return false;
  const keywords = INTEREST_KEYWORDS[interest];
  const lower = bestFor.map((b) => b.toLowerCase());
  return keywords.some((kw) => lower.some((b) => b.includes(kw)));
}

/**
 * Score a discover item (0 = no match, higher = better match).
 * Uses interests only; favorite regions could boost score in future.
 */
export function scoreDiscoverItem(
  item: DiscoverItem,
  interests: Interest[]
): number {
  if (interests.length === 0) return 0;
  let score = 0;
  for (const interest of interests) {
    // Type match
    const typeInterests = TYPE_TO_INTEREST[item.type] ?? [];
    if (typeInterests.includes(interest)) score += 2;
    // bestFor match
    if (bestForMatchesInterest(item.bestFor, interest)) score += 3;
    // Description/highlights could be added; bestFor is primary signal
  }
  return score;
}

/**
 * Sort discover items by personalization score (highest first).
 * Preserves original order for items with same score.
 */
export function sortDiscoverItemsByInterests<T extends DiscoverItem>(
  items: T[],
  interests: Interest[]
): T[] {
  if (interests.length === 0) return items;
  return [...items].sort((a, b) => {
    const sa = scoreDiscoverItem(a, interests);
    const sb = scoreDiscoverItem(b, interests);
    return sb - sa; // descending
  });
}

/** Template bestFor labels that map to interests. */
const TEMPLATE_BESTFOR_TO_INTEREST: Record<string, Interest> = {
  "hiking": "active",
  "trails": "active",
  "bouldering": "bouldering",
  "climbing": "climbing",
  "cycling": "cycling",
  "bike": "cycling",
  "villages": "villages",
  "culture": "culture",
  "history": "culture",
  "wine": "wine",
  "beaches": "wellness",
};

/** Template bestFor labels that map to traveler types. */
const TEMPLATE_BESTFOR_TO_TRAVELER: Record<string, TravelerType> = {
  "families": "family",
  "kids": "family",
  "couples": "couple",
  "groups": "group",
  "nomad": "nomad",
  "bleisure": "nomad",
};

/**
 * Score a template for user preferences (0 = no match, higher = better).
 */
export function scoreTemplate(
  template: ItineraryTemplate,
  interests: Interest[],
  travelerType: TravelerType | null
): number {
  let score = 0;
  const lowerBestFor = template.bestFor.map((b) => b.toLowerCase());

  for (const interest of interests) {
    const kw = INTEREST_KEYWORDS[interest];
    if (kw.some((k) => lowerBestFor.some((b) => b.includes(k)))) score += 3;
    const mapped = Object.entries(TEMPLATE_BESTFOR_TO_INTEREST).find(
      ([label, i]) => i === interest && lowerBestFor.some((b) => b.includes(label))
    );
    if (mapped) score += 2;
  }

  if (travelerType) {
    for (const [label, type] of Object.entries(TEMPLATE_BESTFOR_TO_TRAVELER)) {
      if (type === travelerType && lowerBestFor.some((b) => b.includes(label))) {
        score += 4; // Strong signal for traveler type
        break;
      }
    }
  }

  return score;
}

/**
 * Filter and sort templates by relevance to preferences.
 * Returns templates with score > 0, sorted by score descending.
 */
export function getRecommendedTemplates<T extends ItineraryTemplate>(
  templates: T[],
  interests: Interest[],
  travelerType: TravelerType | null
): T[] {
  const hasPrefs = interests.length > 0 || travelerType != null;
  if (!hasPrefs) return [];

  const scored = templates
    .map((t) => ({ template: t, score: scoreTemplate(t, interests, travelerType) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.template);
}
