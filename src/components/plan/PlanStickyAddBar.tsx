"use client";

import { useEffect, useState } from "react";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { LAYOUT } from "@/lib/design-tokens";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";

type PlanStickyAddBarProps = {
  sentinelId: string;
  scrollTargetId: string;
  /** When provided, clicking the bar opens this action (e.g. Browse modal) instead of scrolling */
  onAddPlaceClick?: () => void;
};

/**
 * Shows a sticky bottom bar with "Add place" on mobile when the add-places
 * section scrolls out of view. Clicking opens the add flow (modal) or scrolls to add area.
 * When visible, hides Plan tab in BottomNav to avoid duplicate CTAs.
 * Hides when footer is in view to prevent overlap.
 */
export default function PlanStickyAddBar({ sentinelId, scrollTargetId, onAddPlaceClick }: PlanStickyAddBarProps) {
  const [show, setShow] = useState(false);
  const { setStickyPlanVisible } = useStickyPlanBar();

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    const footerSentinel = document.getElementById(FOOTER_SENTINEL_ID);
    if (!sentinel) return;

    let addBarVisible = false;
    let footerInView = false;

    const updateShow = () => setShow(addBarVisible && !footerInView);

    const addObserver = new IntersectionObserver(
      ([entry]) => {
        addBarVisible = !entry.isIntersecting;
        updateShow();
      },
      { threshold: 0 }
    );

    const footerObserver = footerSentinel
      ? new IntersectionObserver(
          ([entry]) => {
            footerInView = entry.isIntersecting;
            updateShow();
          },
          { threshold: 0 }
        )
      : null;

    addObserver.observe(sentinel);
    if (footerSentinel && footerObserver) footerObserver.observe(footerSentinel);

    return () => {
      addObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [sentinelId]);

  useEffect(() => {
    setStickyPlanVisible(show);
    return () => setStickyPlanVisible(false);
  }, [show, setStickyPlanVisible]);

  const handleClick = () => {
    if (onAddPlaceClick) {
      onAddPlaceClick();
      return;
    }
    const target = document.getElementById(scrollTargetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!show) return null;

  return (
    <div
      className={`fixed left-0 right-0 ${LAYOUT.fixedBottomClearance} z-30 flex items-center justify-center p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden`}
      role="complementary"
      aria-label="Add place"
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full max-w-md min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold bg-terracotta text-white hover:bg-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:active:scale-100"
      >
        Add place
      </button>
    </div>
  );
}
