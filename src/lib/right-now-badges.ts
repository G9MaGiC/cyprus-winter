/** Stable keys — localized in RightNowCard via home.rightNow.discoveryBadges.* */
export const DISCOVERY_BADGE_CODES = [
  "hidden_gem_near_you",
  "only_locals_know",
  "trending_today",
  "perfect_sunset_today",
] as const;

export type DiscoveryBadge = (typeof DISCOVERY_BADGE_CODES)[number];

export function isDiscoveryBadgeCode(value: string): value is DiscoveryBadge {
  return (DISCOVERY_BADGE_CODES as readonly string[]).includes(value);
}
