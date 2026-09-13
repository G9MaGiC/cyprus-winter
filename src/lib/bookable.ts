import type { Winery } from "@/data/wineries";
import type { Guide } from "@/data/guides";

/**
 * Launch-truth hardening: a winery is bookable only when it can actually
 * receive a booking request — the record is not flagged non-bookable and a
 * real booking channel exists. Kept in lib (not scanned by i18n:extract) so
 * the book/winery list page stays extraction-stable.
 */
export function isWineryBookable(winery: Winery): boolean {
  return winery.isBookable !== false && Boolean(winery.bookingUrl);
}

/**
 * A guide appears on public and booking surfaces only when the record is
 * published (unverified placeholder brands stay out — see
 * docs/PARTNER_DATA_VERIFICATION_2026-09-02.md).
 */
export function isGuidePublic(guide: Guide): boolean {
  return guide.isPublic !== false;
}
