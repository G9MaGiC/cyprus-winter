"use client";

import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
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
      data-overlay-priority="blocking"
      data-overlay-active="true"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label="Cookie consent"
      className={`fixed left-0 right-0 ${LAYOUT.fixedBottomAboveNavMaxMd} md:bottom-0 z-[90] p-4 md:p-5 bg-sand-100 border-t border-sand-300 shadow-lg safe-area-pb`}
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <p className="text-sm text-olive/90">
          We use essential cookies for the service and optional analytics to improve it. By clicking &quot;Accept&quot; you allow analytics.{" "}
          <Link href="/privacy#cookies" className="text-terracotta hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex flex-wrap max-[359px]:flex-col gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReject}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto justify-center ${CTA.secondaryCompact}`}
          >
            <span className="max-[359px]:hidden">Essential only</span>
            <span className="min-[360px]:hidden">Essential</span>
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto justify-center ${CTA.primaryCompact}`}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
