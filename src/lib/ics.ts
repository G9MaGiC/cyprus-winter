/**
 * Shared RFC 5545 text escaping for every ICS builder (plan + booking).
 * One copy on purpose: the E2E-01 double-escaping bug lived exactly in the
 * gap between two private copies of these rules.
 */
export function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
