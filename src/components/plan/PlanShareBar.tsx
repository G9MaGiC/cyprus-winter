"use client";

import { useEffect, useRef, useState } from "react";
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
      aria-label="Itinerary summary and share"
      className={`${STRIP.py} bg-sand-100/70 border-y border-sand-200/80 ${LAYOUT.stickyBarX}`}
    >
      <div className={`${LAYOUT.list} mx-auto flex flex-wrap items-center justify-between gap-4`}>
        <p className="text-sm text-olive/80 leading-relaxed" aria-live="polite" role="status">
          <span className="font-semibold text-terracotta tabular-nums">{totalPlaces}</span> places in{" "}
          <span className="font-semibold text-aegean tabular-nums">{activeDaysCount}</span>/{displayDaysCount} days · Auto-saved
        </p>
        <div className="relative" ref={shareMenuRef}>
          <button
            ref={shareMenuTriggerRef}
            type="button"
            onClick={() => setShareMenuOpen((v) => !v)}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-olive/80 hover:text-terracotta hover:bg-terracotta/5 border border-sand-200/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-expanded={shareMenuOpen}
            aria-haspopup="true"
          >
            Copy & share
            <span className={`text-olive/50 transition-transform ${shareMenuOpen ? "rotate-180" : ""}`} aria-hidden>
              ▾
            </span>
          </button>
          {shareMenuOpen && (
            <div className="absolute right-0 top-full mt-1 py-2 rounded-xl bg-background border border-sand-200/80 shadow-lg min-w-[200px] z-10 section-reveal">
              <button
                ref={shareMenuFirstItemRef}
                type="button"
                onClick={() => {
                  copyShareLink();
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
                className="w-full min-h-[44px] px-4 py-2 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
              >
                {linkCopied ? "Link copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  copyItinerary();
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
                className="w-full min-h-[44px] px-4 py-2 text-left text-sm font-medium text-olive hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
              >
                {copied ? "Copied" : "Copy itinerary (text)"}
              </button>
              <div
                className="px-4 py-2 border-t border-sand-200/80"
                onClick={() => {
                  setShareMenuOpen(false);
                  requestAnimationFrame(() => shareMenuTriggerRef.current?.focus());
                }}
              >
                <ShareLinks path={sharePath} text="My Cyprus Winter itinerary —" ariaLabel="Share via" className="flex flex-wrap gap-2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
