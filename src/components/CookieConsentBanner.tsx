"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CTA, LAYOUT } from "@/lib/design-tokens";
import { setCookieConsent, COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("cookie-consent-change", callback);
  return () => window.removeEventListener("cookie-consent-change", callback);
}

function getSnapshot(): string | null {
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored === "all" || stored === "essential" ? stored : null;
}

function getServerSnapshot() {
  return null;
}

export default function CookieConsentBanner() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (choice !== null) return null;

  const handleAccept = () => setCookieConsent("all");
  const handleReject = () => setCookieConsent("essential");

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-5 bg-sand-100 border-t border-sand-300 shadow-lg safe-area-pb"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <p className="text-sm text-olive/90">
          We use essential cookies for the service and optional analytics to improve it. By clicking &quot;Accept&quot; you allow analytics.{" "}
          <Link href="/privacy#cookies" className="text-terracotta hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReject}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium ${CTA.secondaryCompact}`}
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium ${CTA.primaryCompact}`}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
