"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CARD, CTA, LAYER, TRANSITION } from "@/lib/design-tokens";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";
import { PWA_INSTALL_DISMISSED_KEY, PWA_VISIT_COUNT_KEY } from "@/lib/local-storage-keys";
import { getItineraryStorageKey } from "@/lib/itinerary-storage";
import type { BeforeInstallPromptEvent } from "@/types/before-install-prompt";

function hasPlanInStorage(): boolean {
  try {
    const raw = localStorage.getItem(getItineraryStorageKey());
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return Object.values(parsed).some((ids) => Array.isArray(ids) && ids.length > 0);
  } catch {
    return false;
  }
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function InstallPromptBanner() {
  const t = useTranslations("pwa.prompt");
  const blocked = useBlockingOverlaysActive();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "true") return;

    const count = parseInt(localStorage.getItem(PWA_VISIT_COUNT_KEY) ?? "0", 10) + 1;
    localStorage.setItem(PWA_VISIT_COUNT_KEY, String(count));

    const eligible = count >= 2 || hasPlanInStorage();
    if (!eligible) return;

    if (isIos()) {
      setIosMode(true);
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [mounted]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "true");
    } catch {
      /* ignore */
    }
    setVisible(false);
    deferredRef.current = null;
  }, []);

  const install = useCallback(async () => {
    const ev = deferredRef.current;
    if (!ev) {
      dismiss();
      return;
    }
    try {
      await ev.prompt();
      await ev.userChoice;
    } catch {
      /* ignore */
    }
    dismiss();
  }, [dismiss]);

  if (!mounted || !visible || blocked) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-[var(--cw-cookie-banner-offset,0px)] ${LAYER.onboarding} px-4 pb-4 sm:pb-6 transition-all ${TRANSITION.medium} ease-out translate-y-0 opacity-100 motion-reduce:transition-none`}
      role="region"
      aria-label={t("title")}
    >
      <div className={`${CARD.base} mx-auto max-w-lg ${CARD.content} shadow-xl border border-sand-200/80`}>
        <p className="font-semibold text-charcoal mb-1">{t("title")}</p>
        <p className="text-sm text-olive/80 mb-3">{iosMode ? t("iosHint") : t("body")}</p>
        <div className="flex flex-wrap gap-2">
          {!iosMode && (
            <button type="button" onClick={install} className={`${CTA.primaryCompact} min-h-[44px]`}>
              {t("install")}
            </button>
          )}
          <button type="button" onClick={dismiss} className={`${CTA.secondaryCompact} min-h-[44px]`}>
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
