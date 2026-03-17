"use client";

import { useEffect, useState } from "react";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";

type StickyAddToPlanBarProps = {
  placeId: string;
  sentinelId: string;
  label?: string;
};

/**
 * Shows a sticky bottom bar with "Add to plan" on mobile when
 * the main CTA in the footer scrolls out of view.
 * Hides when footer is in view to prevent overlap.
 */
export default function StickyAddToPlanBar({
  placeId,
  sentinelId,
  label = "Add to plan",
}: StickyAddToPlanBarProps) {
  const [show, setShow] = useState(false);

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

  if (!show) return null;

  return (
    <div
      className={`fixed left-0 right-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom)+var(--cw-cookie-banner-offset,0px))] z-30 flex items-center justify-center p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 sm:hidden`}
      role="complementary"
      aria-label={label}
    >
      <AddToItineraryButton placeId={placeId} label={label} className="w-full max-w-md" />
    </div>
  );
}
