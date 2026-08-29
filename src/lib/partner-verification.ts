/**
 * Partner verification gate for user-facing trust claims and notifications.
 *
 * Data records carry `isVerified` ahead of partner onboarding, but several
 * contacts are still RFC 2606 placeholders (…@cyprus-winter.example) that can
 * never receive a booking request. Until a real address is wired, the app must
 * not show a "Verified partner" badge or count the partner as reachable —
 * this helper self-heals the moment the data carries a deliverable address.
 */

const PLACEHOLDER_DOMAIN_RE = /\.(example|test|invalid|localhost)$/i;

export function hasReachablePartnerEmail(partnerEmail: string | undefined): boolean {
  const email = partnerEmail?.trim().toLowerCase();
  if (!email) return false;
  const domain = email.split("@")[1] ?? "";
  return domain.length > 0 && !PLACEHOLDER_DOMAIN_RE.test(domain);
}

export function isPartnerVerified(partner: {
  isVerified?: boolean;
  partnerEmail?: string;
}): boolean {
  return Boolean(partner.isVerified) && hasReachablePartnerEmail(partner.partnerEmail);
}
