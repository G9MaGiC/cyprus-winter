/**
 * Call-ahead detection for opening-hours copy. Lives in its own module so
 * both the hours projections (place-card-hours) and the overlay modules
 * (attraction-content, partner-overlay) can share it without import cycles.
 */
const CALL_AHEAD_RE =
  /call ahead|by appointment|appointment recommended|reservations required/i;

export function isCallAheadHours(text: string | undefined): boolean {
  if (!text) return false;
  return CALL_AHEAD_RE.test(text);
}
