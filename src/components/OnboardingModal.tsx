"use client";

/**
 * First-time user onboarding — lightweight welcome bar.
 * Single step, delayed show, optional intent. Discovery-first. No account gate.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import Image from "next/image";
import { Compass, MapPin, Route, Eye } from "lucide-react";
import { CTA, CARD } from "@/lib/design-tokens";
import { ONBOARDING_KEY, INTENT_KEY } from "@/lib/local-storage-keys";
import { useTrapFocus } from "@/lib/useTrapFocus";
import { dispatchBlockingOverlayDirty } from "@/lib/blocking-overlay-events";

const SCROLL_THRESHOLD_PX = 100;
const DELAY_MS = 2000;
function shouldShowOnboardingOnPath(pathname: string | null): boolean {
  const resolvedPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : null);
  if (!resolvedPath) return true;
  const normalized = resolvedPath.toLowerCase().replace(/\/+$/, "") || "/";
  if (normalized === "/" || /^\/[a-z]{2}$/.test(normalized)) return true;
  const segments = normalized.split("/").filter(Boolean);
  return segments.includes("discover");
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write errors (private mode / quota / blocked storage).
  }
}

function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage delete errors.
  }
}

export function useOnboarding() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      setShowOnboarding(!safeGetLocalStorage(ONBOARDING_KEY));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    safeSetLocalStorage(ONBOARDING_KEY, "true");
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
    }
    setShowOnboarding(false);
  }, []);

  const reset = useCallback(() => {
    safeRemoveLocalStorage(ONBOARDING_KEY);
    safeRemoveLocalStorage(INTENT_KEY);
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
    safeSetLocalStorage(INTENT_KEY, value);
    track(`onboarding_intent_${value}` as "onboarding_intent_planning" | "onboarding_intent_exploring" | "onboarding_intent_browsing");
  }
  dismiss();
  if (value === "planning") router.push("/plan");
  else if (value === "exploring") router.push("/discover");
  // browsing: stay on home
}

export default function OnboardingModal() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("onboarding");
  const { showOnboarding, dismiss, isClient } = useOnboarding();
  const showOnboardingOnPath = shouldShowOnboardingOnPath(pathname);
  const [visible, setVisible] = useState(false);
  const trapFocus = useTrapFocus();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const hasTrackedStarted = useRef(false);
  useEffect(() => {
    if (!isClient || !showOnboarding || !showOnboardingOnPath) {
      const timer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(timer);
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      document.body.style.overflow = "hidden";
      setVisible(true);
      if (!hasTrackedStarted.current) {
        hasTrackedStarted.current = true;
        track("onboarding_started");
      }
    };

    const timer = setTimeout(show, DELAY_MS);
    const onScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD_PX) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isClient, showOnboarding, showOnboardingOnPath]);

  const handleDismiss = useCallback(() => {
    track("onboarding_dismissed");
    dismiss();
  }, [dismiss]);

  useEffect(() => {
    if (!visible) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => primaryActionRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow === "hidden" ? "" : previousOverflow;
      previousActiveRef.current?.focus?.();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      handleDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, handleDismiss]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    dispatchBlockingOverlayDirty();
  }, [visible]);

  if (!isClient || !showOnboarding || !showOnboardingOnPath || !visible) return null;

  return (
    <div
      data-overlay-priority="blocking"
      data-overlay-active="true"
      className="fixed inset-x-0 max-md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-[100] transition-all duration-300 ease-out translate-y-0 opacity-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      onKeyDown={(e) => trapFocus(e, dialogRef.current, handleDismiss)}
    >
      <div ref={dialogRef} className={`${CARD.base} mx-4 mb-4 sm:mx-auto sm:max-w-lg sm:mb-6 overflow-hidden shadow-xl`}>
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
          <p id="onboarding-description" className="text-olive/80 text-base mb-4">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              ref={primaryActionRef}
              type="button"
              onClick={() => {
                handleIntent("exploring", dismiss, router);
              }}
              className={`${CTA.primaryCompact} flex-1 inline-flex items-center justify-center gap-2`}
              aria-label="Start exploring places and trails"
            >
              <Compass className="h-4 w-4" aria-hidden />
              {t("cta")}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] px-4 text-sm text-olive/50 hover:text-terracotta transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 flex items-center justify-center"
              aria-label="Skip onboarding"
            >
              {t("skip")}
            </button>
          </div>

          <p className="text-sm text-olive/60 mb-2">{t("intentQuestion")}</p>
          <div className="flex flex-col min-[360px]:flex-row min-[360px]:flex-wrap gap-2" role="group" aria-label="Intent options">
            <button
              type="button"
              onClick={() => handleIntent("planning", dismiss, router)}
              className="inline-flex items-center justify-center min-[360px]:justify-start gap-2 min-h-[44px] px-3 rounded-lg text-sm font-medium text-olive/80 hover:text-terracotta border border-sand-200 hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 min-[360px]:flex-1 min-[360px]:min-w-[150px]"
              aria-label="Planning my trip"
            >
              <Route className="h-4 w-4 text-aegean" aria-hidden />
              {t("intentPlanning")}
            </button>
            <button
              type="button"
              onClick={() => handleIntent("exploring", dismiss, router)}
              className="inline-flex items-center justify-center min-[360px]:justify-start gap-2 min-h-[44px] px-3 rounded-lg text-sm font-medium text-olive/80 hover:text-terracotta border border-sand-200 hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 min-[360px]:flex-1 min-[360px]:min-w-[150px]"
              aria-label="Exploring places"
            >
              <MapPin className="h-4 w-4 text-aegean" aria-hidden />
              {t("intentExploring")}
            </button>
            <button
              type="button"
              onClick={() => handleIntent("browsing", dismiss, router)}
              className="inline-flex items-center justify-center min-[360px]:justify-start gap-2 min-h-[44px] px-3 rounded-lg text-sm font-medium text-olive/80 hover:text-terracotta border border-sand-200 hover:border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 min-[360px]:flex-1 min-[360px]:min-w-[150px]"
              aria-label="Just browsing"
            >
              <Eye className="h-4 w-4 text-aegean" aria-hidden />
              {t("intentBrowsing")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
