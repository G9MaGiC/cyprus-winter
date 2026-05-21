/**
 * EU cookie consent. Non-essential (analytics) cookies require consent.
 * Stored in localStorage. Essential cookies (session, preferences, plan) run without consent.
 */
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/client-storage";

export const COOKIE_CONSENT_KEY = "cyprus-winter:cookie-consent";

export type CookieConsent = "all" | "essential";

export function getCookieConsent(): CookieConsent | null {
  const raw = safeLocalStorageGet(COOKIE_CONSENT_KEY);
  if (raw === "all" || raw === "essential") return raw;
  return null;
}

export function setCookieConsent(value: CookieConsent): void {
  if (typeof window === "undefined") return;
  safeLocalStorageSet(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "all";
}
