"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import AppLink from "@/components/AppLink";
import { CTA, LAYER, LAYOUT, SECTION } from "@/lib/design-tokens";
import { setCookieConsent, COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";
import { dispatchBlockingOverlayDirty } from "@/lib/blocking-overlay-events";
import { safeLocalStorageGet } from "@/lib/client-storage";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("cookie-consent-change", callback);
  return () => window.removeEventListener("cookie-consent-change", callback);
}

function getSnapshot(): string | null {
  const stored = safeLocalStorageGet(COOKIE_CONSENT_KEY);
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

  useEffect(() => {
    if (choice !== null) return;
    dispatchBlockingOverlayDirty();
    return () => dispatchBlockingOverlayDirty();
  }, [choice]);

  const handleAccept = () => setCookieConsent("all");
  const handleReject = () => setCookieConsent("essential");

  if (choice !== null) return null;

  return (
    <div
      ref={bannerRef}
      data-overlay-priority="blocking"
      data-overlay-active="true"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="cookie-banner-title"
      className={`fixed left-0 right-0 ${LAYOUT.fixedBottomAboveNavMaxMd} md:bottom-0 ${LAYER.cookieBanner} p-4 md:p-5 bg-sand-100 border-t border-sand-300 shadow-lg safe-area-pb`}
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
