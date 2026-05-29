"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ShareLinks from "@/components/ShareLinks";
import { CTA, LAYER, LAYOUT, STRIP } from "@/lib/design-tokens";

type PlanShareBarProps = {
  totalPlaces: number;
  activeDaysCount: number;
  displayDaysCount: number;
  copied: boolean;
  linkCopied: boolean;
  sharePath: string;
  copyShareLink: () => void;
  copyItinerary: () => void;
  icsDownloaded?: boolean;
  downloadCalendar?: () => void;
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
  icsDownloaded = false,
  downloadCalendar,
}: PlanShareBarProps) {
  const tPlan = useTranslations("plan");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuTriggerRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div
      role="region"
      aria-label={tPlan("aria.shareRegion")}
      className={`${STRIP.py} py-5 sm:py-6 ${STRIP.surfaceSand} ${LAYOUT.stickyBarX}`}
    >
      <div className={`${LAYOUT.list} mx-auto flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between`}>
        <p
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-olive/80 leading-relaxed min-w-0"
          aria-live="polite"
          role="status"
        >
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={copyShareLink}
            className={`min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              linkCopied
                ? "bg-aegean/15 text-aegean border border-aegean/25"
                : `${CTA.primaryCompact} active:scale-[0.98] motion-reduce:active:scale-100`
            }`}
            aria-label={tPlan("share.copyLink")}
          >
            {linkCopied ? tPlan("share.linkCopied") : tPlan("share.copyLink")}
          </button>
          <button
            type="button"
            onClick={copyItinerary}
            className={`min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              copied
                ? "bg-aegean/15 text-aegean border border-aegean/25"
                : CTA.secondaryCompact
            }`}
            aria-label={tPlan("share.copyItinerary")}
          >
            {copied ? tPlan("share.copied") : tPlan("share.copyItineraryShort")}
          </button>
          {downloadCalendar && (
            <button
              type="button"
              onClick={downloadCalendar}
              className={`min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                icsDownloaded
                  ? "bg-aegean/15 text-aegean border border-aegean/25"
                  : CTA.secondaryCompact
              }`}
              aria-label={tPlan("share.downloadIcs")}
            >
              {icsDownloaded ? tPlan("share.icsDownloaded") : tPlan("share.downloadIcs")}
            </button>
          )}
          <div className="relative" ref={shareMenuRef}>
            <button
              ref={shareMenuTriggerRef}
              type="button"
              onClick={() => setShareMenuOpen((v) => !v)}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/90 text-olive border border-sand-200/80 hover:border-terracotta/20 hover:bg-sand-100/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={shareMenuOpen}
              aria-haspopup="menu"
              aria-label={tPlan("aria.shareVia")}
            >
              {tPlan("share.copyAndShare")}
              <span className={`text-olive/50 transition-transform duration-200 ${shareMenuOpen ? "rotate-180" : ""}`} aria-hidden>
                ▾
              </span>
            </button>
            {shareMenuOpen && (
              <div
                role="menu"
                className={`absolute right-0 top-full mt-2 py-3 px-4 rounded-2xl bg-background border border-sand-200/80 shadow-xl min-w-[220px] ${LAYER.popover} animate-in fade-in slide-in-from-top-2 duration-200`}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShareMenuOpen(false);
                    shareMenuTriggerRef.current?.focus();
                  }
                }}
              >
                <ShareLinks
                  path={sharePath}
                  text={tPlan("share.shareTextPrefix")}
                  ariaLabel={tPlan("aria.shareVia")}
                  className="flex flex-wrap gap-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
