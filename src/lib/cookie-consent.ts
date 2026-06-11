/**
 * EU cookie consent. Non-essential (analytics) cookies require consent.
 * Stored in localStorage. Essential cookies (session, preferences, plan) run without consent.
 */
export const COOKIE_CONSENT_KEY = "cyprus-winter:cookie-consent";

export type CookieConsent = "all" | "essential";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === "all" || raw === "essential") return raw;
  } catch {
    return null;
  }
  return null;
}

export function setCookieConsent(value: CookieConsent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
  } catch {
    // Storage can be unavailable in privacy modes.
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "all";
}
