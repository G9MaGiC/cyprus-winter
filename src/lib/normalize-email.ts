/** Canonical email normalization used across booking and token flows. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
