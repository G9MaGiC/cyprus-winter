"use client";

/**
 * First-time user onboarding — lightweight welcome bar.
 * Single step, delayed show, optional intent. Discovery-first. No account gate.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import Image from "next/image";
import { Compass, MapPin, Route, Eye } from "lucide-react";
import { CARD } from "@/lib/design-tokens";
import { ONBOARDING_KEY, INTENT_KEY } from "@/lib/local-storage-keys";

const SCROLL_THRESHOLD_PX = 100;
const DELAY_MS = 2000;

export function useOnboarding() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setShowOnboarding(!localStorage.getItem(ONBOARDING_KEY));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(INTENT_KEY);
    setShowOnboarding(true);
  }, []);

  return { showOnboarding, dismiss, reset, isClient: mounted };
}

type IntentValue = "planning" | "exploring" | "browsing" | null;

function handleIntent(
  value: IntentValue,
  dismiss: () => void,
  router: ReturnType<typeof useRouter>
) {
  if (value) {
    localStorage.setItem(INTENT_KEY, value);
    track(`onboarding_intent_${value}` as "onboarding_intent_planning" | "onboarding_intent_exploring" | "onboarding_intent_browsing");
  }
  dismiss();
  if (value === "planning") router.push("/plan");
  else if (value === "exploring") router.push("/discover");
  // browsing: stay on home
}

export default function OnboardingModal() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const { showOnboarding, dismiss, isClient } = useOnboarding();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isClient || !showOnboarding) return;
    const timer = setTimeout(() => setReady(true), DELAY_MS);

    const onScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD_PX) setReady(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isClient, showOnboarding]);

  const hasTrackedStarted = useRef(false);
  useEffect(() => {
    if (!ready || !showOnboarding) return;
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      if (!hasTrackedStarted.current) {
        hasTrackedStarted.current = true;
        track("onboarding_started");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, showOnboarding]);

  // Move focus into the onboarding panel when it becomes visible and restore on dismiss
  useEffect(() => {
    if (!visible) return;
    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const firstAction = panel.querySelector<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      (firstAction ?? panel).focus?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const handleDismiss = useCallback(() => {
    track("onboarding_dismissed");
    dismiss();
    previouslyFocusedRef.current?.focus?.();
  }, [dismiss]);

  if (!isClient || !showOnboarding) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-[var(--cw-cookie-banner-offset,0px)] z-[100] transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div
        ref={panelRef}
        className={`${CARD.base} mx-4 mb-4 sm:mx-auto sm:max-w-lg sm:mb-6 overflow-hidden shadow-xl`}
      >
        {/* Hero image strip with gradient overlay */}
        <div className="relative h-24 sm:h-28 w-full bg-sand-200">
          <Image
            src="/images/cyprus/cyprus-trail-gorge.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
            <Compass className="h-5 w-5 shrink-0 text-terracotta" aria-hidden />
            <h2 id="onboarding-title" className="font-display text-lg font-bold">
              {t("welcome")}
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <p id="onboarding-description" className="text-olive/70 text-sm mb-4 sr-only">
            {t("description")}
          </p>

          {/* Primary intent buttons — lead the interaction */}
          <div className="flex flex-col gap-2.5" role="group" aria-label={t("aria.intentGroup")}>
            <button
              type="button"
              onClick={() => handleIntent("planning", dismiss, router)}
              className="w-full min-h-[52px] px-4 py-3 rounded-xl border border-sand-200 bg-white hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-label={t("aria.intentPlanning")}
            >
              <Route className="h-5 w-5 shrink-0 text-aegean" aria-hidden />
              <span className="flex-1 font-medium text-olive">{t("intentPlanning")}</span>
              <span className="text-olive/30 text-sm" aria-hidden>›</span>
            </button>
            <button
              type="button"
              onClick={() => handleIntent("exploring", dismiss, router)}
              className="w-full min-h-[52px] px-4 py-3 rounded-xl border border-sand-200 bg-white hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-label={t("aria.intentExploring")}
            >
              <MapPin className="h-5 w-5 shrink-0 text-aegean" aria-hidden />
              <span className="flex-1 font-medium text-olive">{t("intentExploring")}</span>
              <span className="text-olive/30 text-sm" aria-hidden>›</span>
            </button>
            <button
              type="button"
              onClick={() => handleIntent("browsing", dismiss, router)}
              className="w-full min-h-[52px] px-4 py-3 rounded-xl border border-sand-200 bg-white hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-label={t("aria.intentBrowsing")}
            >
              <Eye className="h-5 w-5 shrink-0 text-aegean" aria-hidden />
              <span className="flex-1 font-medium text-olive">{t("intentBrowsing")}</span>
              <span className="text-olive/30 text-sm" aria-hidden>›</span>
            </button>
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] px-4 text-sm text-olive/40 hover:text-terracotta transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              aria-label={t("aria.skip")}
            >
              {t("skip")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
