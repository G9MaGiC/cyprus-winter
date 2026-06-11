/**
 * EU cookie consent. Non-essential (analytics) cookies require consent.
 * Stored in localStorage. Essential cookies (session, preferences, plan) run without consent.
 */
export const COOKIE_CONSENT_KEY = "cyprus-winter:cookie-consent";

export type CookieConsent = "all" | "essential";

let inMemoryConsent: CookieConsent | null = null;

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === "all" || raw === "essential") {
      inMemoryConsent = raw;
      return raw;
    }
  } catch {
    return inMemoryConsent;
  }
  return inMemoryConsent;
}

export function setCookieConsent(value: CookieConsent): void {
  if (typeof window === "undefined") return;
  inMemoryConsent = value;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Storage can be unavailable in privacy modes.
  }
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "all";
}
