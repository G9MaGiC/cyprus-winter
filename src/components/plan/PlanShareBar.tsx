"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ShareLinks from "@/components/ShareLinks";
import { LAYOUT, STRIP } from "@/lib/design-tokens";

type PlanShareBarProps = {
  totalPlaces: number;
  activeDaysCount: number;
  displayDaysCount: number;
  copied: boolean;
  linkCopied: boolean;
  sharePath: string;
  copyShareLink: () => void;
  copyItinerary: () => void;
};

export default function PlanShareBar({
  totalPlaces,
  activeDaysCount,
  displayDaysCount,
  copied,
  linkCopied,
  sharePath,
  copyShareLink,
  copyItinerary,
}: PlanShareBarProps) {
  const tPlan = useTranslations("plan");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const shareMenuFirstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shareMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false);
        requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
      }
    };
    document.addEventListener("click", close, { capture: true });
    return () => document.removeEventListener("click", close, { capture: true });
  }, [shareMenuOpen]);

  useEffect(() => {
    if (shareMenuOpen) shareMenuFirstItemRef.current?.focus();
  }, [shareMenuOpen]);

  return (
    <div
      role="region"
      aria-label={tPlan("aria.shareRegion")}
      className={`${STRIP.py} py-5 sm:py-6 ${STRIP.surfaceSand} ${LAYOUT.stickyBarX}`}
    >
      <div className={`${LAYOUT.list} mx-auto flex flex-wrap items-center justify-between gap-4`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-olive/80 leading-relaxed min-w-0 flex-1 min-[400px]:flex-initial" aria-live="polite" role="status">
          <span className="inline-flex items-center min-h-[24px] px-2.5 rounded-lg bg-terracotta/10 text-terracotta font-semibold tabular-nums">
            {totalPlaces}
          </span>
          <span className="text-olive/60">{tPlan("share.placesLabel")}</span>
          <span className="inline-flex items-center min-h-[24px] px-2.5 rounded-lg bg-aegean/10 text-aegean font-semibold tabular-nums">
            {activeDaysCount}/{displayDaysCount}
          </span>
          <span className="text-olive/60">{tPlan("share.daysLabel")}</span>
          <span className="text-olive/50">· {tPlan("autoSaved")}</span>
        </p>
        <div className="relative" ref={shareMenuRef}>
          <button
            ref={shareMenuTriggerRef}
            type="button"
            onClick={() => setShareMenuOpen((v) => !v)}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-terracotta/10 text-terracotta hover:bg-terracotta/15 border border-terracotta/15 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={shareMenuOpen}
            aria-haspopup="menu"
            aria-label={tPlan("aria.shareMenu")}
          >
            {tPlan("share.copyAndShare")}
            <span className={`text-terracotta/70 transition-transform duration-200 ${shareMenuOpen ? "rotate-180" : ""}`} aria-hidden>
              ▾
            </span>
          </button>
          {shareMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 py-2 rounded-2xl bg-background border border-sand-200/80 shadow-xl min-w-[220px] z-10 animate-in fade-in slide-in-from-top-2 duration-200"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShareMenuOpen(false);
                  shareMenuTriggerRef.current?.focus();
                }
              }}
            >
              <button
                ref={shareMenuFirstItemRef}
                type="button"
                role="menuitem"
                onClick={() => {
                  copyShareLink();
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
                className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
              >
                {linkCopied ? tPlan("share.linkCopied") : tPlan("share.copyLink")}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  copyItinerary();
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
                className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
              >
                {copied ? tPlan("share.copied") : tPlan("share.copyItinerary")}
              </button>
              <div
                className="px-4 py-3 mt-2 border-t border-sand-200/80"
                onClick={() => {
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
              >
                <ShareLinks
                  path={sharePath}
                  text={tPlan("share.shareTextPrefix")}
                  ariaLabel={tPlan("aria.shareVia")}
                  className="flex flex-wrap gap-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
