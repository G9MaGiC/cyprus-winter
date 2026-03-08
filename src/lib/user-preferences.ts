/**
 * User preferences for personalization.
 * Stored in localStorage for client-side state (aligns with TECHNICAL.md UserPreferences).
 * Synced to Supabase when user is authenticated (Phase 2+).
 */

export type Interest = "active" | "culture" | "wine" | "wellness" | "villages";
export type TravelerType = "solo" | "couple" | "family" | "group" | "nomad";

export type UserPreferences = {
  interests: Interest[];
  travelerType: TravelerType | null;
  favoriteRegions: string[];
  homeCity?: string;
  notifyTrailConditions: boolean;
  notifyEvents: boolean;
};

const STORAGE_KEY = "cyprus-user-preferences";

const DEFAULTS: UserPreferences = {
  interests: [],
  travelerType: null,
  favoriteRegions: [],
  notifyTrailConditions: true,
  notifyEvents: true,
};

function load(): UserPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULTS;
    const parsed = JSON.parse(stored) as Partial<UserPreferences>;
    return {
      interests: Array.isArray(parsed.interests) ? parsed.interests.filter(isInterest) : DEFAULTS.interests,
      travelerType: parsed.travelerType && isTravelerType(parsed.travelerType) ? parsed.travelerType : DEFAULTS.travelerType,
      favoriteRegions: Array.isArray(parsed.favoriteRegions) ? parsed.favoriteRegions : DEFAULTS.favoriteRegions,
      homeCity: typeof parsed.homeCity === "string" ? parsed.homeCity : DEFAULTS.homeCity,
      notifyTrailConditions: typeof parsed.notifyTrailConditions === "boolean" ? parsed.notifyTrailConditions : DEFAULTS.notifyTrailConditions,
      notifyEvents: typeof parsed.notifyEvents === "boolean" ? parsed.notifyEvents : DEFAULTS.notifyEvents,
    };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage full or disabled
  }
}

function isInterest(v: string): v is Interest {
  return ["active", "culture", "wine", "wellness", "villages"].includes(v);
}

function isTravelerType(v: string): v is TravelerType {
  return ["solo", "couple", "family", "group", "nomad"].includes(v);
}

export function getUserPreferences(): UserPreferences {
  return load();
}

export function setUserPreferences(partial: Partial<UserPreferences>): UserPreferences {
  const current = load();
  const next: UserPreferences = {
    interests: partial.interests ?? current.interests,
    travelerType: partial.travelerType !== undefined ? partial.travelerType : current.travelerType,
    favoriteRegions: partial.favoriteRegions ?? current.favoriteRegions,
    homeCity: partial.homeCity !== undefined ? partial.homeCity : current.homeCity,
    notifyTrailConditions: partial.notifyTrailConditions ?? current.notifyTrailConditions,
    notifyEvents: partial.notifyEvents ?? current.notifyEvents,
  };
  save(next);
  return next;
}

/** Toggle a single interest on/off. */
export function toggleInterest(interest: Interest): UserPreferences {
  const current = load();
  const next = current.interests.includes(interest)
    ? current.interests.filter((i) => i !== interest)
    : [...current.interests, interest];
  return setUserPreferences({ interests: next });
}

/** Toggle a region in favoriteRegions. */
export function toggleFavoriteRegion(region: string): UserPreferences {
  const current = load();
  const next = current.favoriteRegions.includes(region)
    ? current.favoriteRegions.filter((r) => r !== region)
    : [...current.favoriteRegions, region];
  return setUserPreferences({ favoriteRegions: next });
}

export const INTEREST_LABELS: Record<Interest, string> = {
  active: "Hiking & trails",
  culture: "History & archaeology",
  wine: "Wine & tastings",
  wellness: "Wellness & relaxation",
  villages: "Mountain villages",
};

export const TRAVELER_LABELS: Record<TravelerType, string> = {
  solo: "Solo",
  couple: "Couple",
  family: "Families",
  group: "Group",
  nomad: "Digital nomad",
};
