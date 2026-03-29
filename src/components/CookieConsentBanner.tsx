"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import AppLink from "@/components/AppLink";
import { CTA, LAYOUT, SECTION } from "@/lib/design-tokens";
import { setCookieConsent, COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cookie-consent-change", callback);
  return () => window.removeEventListener("cookie-consent-change", callback);
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored === "all" || stored === "essential" ? stored : null;
}

function getServerSnapshot() {
  return null;
}

export default function CookieConsentBanner() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (choice !== null) return;
    const el = bannerRef.current;
    if (!el) return;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--cw-cookie-banner-offset", `${h}px`);
    };
    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--cw-cookie-banner-offset", "0px");
    };
  }, [choice]);

  const handleAccept = () => setCookieConsent("all");
  const handleReject = () => setCookieConsent("essential");

  if (choice !== null) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-0 left-0 right-0 z-40 p-5 md:p-6 bg-sand-100/98 border-t border-sand-200/70 shadow-[0_-4px_24px_rgba(37,39,48,0.08)] safe-area-pb backdrop-blur-sm"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <p className="text-sm text-olive/90">
          <span id="cookie-banner-title" className="font-semibold">
            Cookie consent.
          </span>{" "}
          We use essential cookies for the service and optional analytics to improve it. By clicking &quot;Accept&quot; you allow analytics.{" "}
          <AppLink href="/privacy#cookies" className={`${SECTION.aegeanLink} -my-2 text-terracotta focus-visible:ring-terracotta/50`}>
            Learn more
          </AppLink>
        </p>
        <div className="flex flex-wrap gap-3.5 shrink-0">
          <button
            type="button"
            onClick={handleReject}
            className={`min-h-[44px] px-6 py-3 rounded-xl text-sm font-medium ${CTA.secondaryCompact}`}
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className={`min-h-[44px] px-6 py-3 rounded-xl text-sm font-medium ${CTA.primaryCompact}`}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
