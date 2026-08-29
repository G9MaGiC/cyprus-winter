"use client";

/**
 * First-time user onboarding — lightweight welcome bar.
 * Single step, delayed show, optional intent. Discovery-first. No account gate.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import Image from "next/image";
import { Compass, MapPin, Route, Eye } from "lucide-react";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { CTA, CARD, TYPE, PILL, TRANSITION, LAYER } from "@/lib/design-tokens";
import { ONBOARDING_KEY, INTENT_KEY } from "@/lib/local-storage-keys";
import { dispatchBlockingOverlayDirty } from "@/lib/blocking-overlay-events";

const SCROLL_THRESHOLD_PX = 100;
const DELAY_MS = 2000;

export function useOnboarding() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      try {
        setShowOnboarding(!localStorage.getItem(ONBOARDING_KEY));
      } catch {
        setShowOnboarding(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Private mode / blocked storage — still dismiss the modal.
    }
    setShowOnboarding(false);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(INTENT_KEY);
    } catch {
      // ignore
    }
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
    try {
      localStorage.setItem(INTENT_KEY, value);
    } catch {
      // ignore
    }
    track(`onboarding_intent_${value}` as "onboarding_intent_planning" | "onboarding_intent_exploring" | "onboarding_intent_browsing");
  }
  dismiss();
  if (value === "planning") router.push("/plan");
  else if (value === "exploring") router.push("/discover");
  // browsing: stay on home
}

function shouldSkipOnboardingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/plan" || pathname.startsWith("/plan/")) return true;
  if (pathname.startsWith("/book/") || pathname.includes("/book/")) return true;
  return false;
}

export default function OnboardingModal() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("onboarding");
  const { showOnboarding, dismiss, isClient } = useOnboarding();
  const skipRoute = shouldSkipOnboardingPath(pathname);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const trapFocus = useTrapFocus();

  useEffect(() => {
    if (!isClient || !showOnboarding || skipRoute) return;
    const timer = setTimeout(() => setReady(true), DELAY_MS);

    const onScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD_PX) setReady(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isClient, showOnboarding, skipRoute]);

  const hasTrackedStarted = useRef(false);
  useEffect(() => {
    if (!ready || !showOnboarding || skipRoute) return;
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      if (!hasTrackedStarted.current) {
        hasTrackedStarted.current = true;
        track("onboarding_started");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, showOnboarding, skipRoute]);

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

  useEffect(() => {
    dispatchBlockingOverlayDirty();
  }, [visible, showOnboarding, skipRoute]);

  const blockingActive = showOnboarding && !skipRoute && visible;

  const handleDismiss = useCallback(() => {
    track("onboarding_dismissed");
    dismiss();
    previouslyFocusedRef.current?.focus?.();
  }, [dismiss]);

  if (!isClient || !showOnboarding || skipRoute) return null;

  return (
    <div
      data-overlay-priority="blocking"
      data-overlay-active={blockingActive ? "true" : "false"}
      inert={!visible ? true : undefined}
      className={`fixed inset-x-0 bottom-[var(--cw-cookie-banner-offset,0px)] ${LAYER.onboarding} transition-all ${TRANSITION.medium} ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal={visible}
      aria-hidden={!visible}
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      onKeyDown={(e) => trapFocus(e, panelRef.current, handleDismiss)}
    >
      <div
        ref={panelRef}
        className="rounded-xl bg-white border border-sand-200/80 mx-4 mb-4 sm:mx-auto sm:max-w-lg sm:mb-6 overflow-hidden shadow-xl"
      >
        {/* Hero image strip with gradient overlay */}
        <div className="relative min-h-[7rem] sm:min-h-[8rem] w-full bg-sand-200 overflow-hidden">
          <Image
            src="/images/cyprus/cyprus-trail-gorge.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
          <div className={`${CARD.mediaOverlay}`} aria-hidden />
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
            <Compass className="h-5 w-5 shrink-0 text-terracotta" aria-hidden />
            <h2 id="onboarding-title" className={`${TYPE.subSectionTitleLg} text-white`}>
              {t("welcome")}
            </h2>
          </div>
        </div>

        <div className={CARD.content}>
          <p id="onboarding-description" className="prose-intro text-muted-ink mb-4">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => {
                handleIntent("exploring", dismiss, router);
              }}
              className={`${CTA.primaryCompact} flex-1 inline-flex items-center justify-center gap-2 ${CARD.interactive}`}
              aria-label={t("aria.startExploring")}
            >
              <Compass className="h-4 w-4" aria-hidden />
              {t("cta")}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] px-4 text-sm text-muted-ink hover:text-muted-ink transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 flex items-center justify-center"
              aria-label={t("aria.skip")}
            >
              {t("skip")}
            </button>
          </div>

          <div className="border-t border-sand-200/60 pt-4 mt-2">
            <p className={`${TYPE.kicker} text-muted-ink mb-2`}>{t("intentLabel")}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("aria.intentGroup")}>
              <button
                type="button"
                onClick={() => handleIntent("planning", dismiss, router)}
                className={`${PILL.base} ${PILL.neutral} gap-2`}
                aria-label={t("aria.intentPlanning")}
              >
                <Route className="h-4 w-4 text-aegean" aria-hidden />
                {t("intentPlanning")}
              </button>
              <button
                type="button"
                onClick={() => handleIntent("exploring", dismiss, router)}
                className={`${PILL.base} ${PILL.neutral} gap-2`}
                aria-label={t("aria.intentExploring")}
              >
                <MapPin className="h-4 w-4 text-aegean" aria-hidden />
                {t("intentExploring")}
              </button>
              <button
                type="button"
                onClick={() => handleIntent("browsing", dismiss, router)}
                className={`${PILL.base} ${PILL.neutral} gap-2`}
                aria-label={t("aria.intentBrowsing")}
              >
                <Eye className="h-4 w-4 text-aegean" aria-hidden />
                {t("intentBrowsing")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
