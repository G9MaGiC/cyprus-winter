"use client";

import AppLink from "@/components/AppLink";
import { useEffect, useState } from "react";
import { CTA, LAYER, LAYOUT } from "@/lib/design-tokens";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";
import { useTranslations } from "next-intl";

type StickyPlanBarProps = {
  sentinelId: string;
};

/**
 * Shows a sticky bottom bar with "Plan your trip" on mobile when
 * the sentinel scrolls out of view. Surfaces Plan CTA without reordering sections.
 * Hides when footer is in view to prevent overlap.
 */
export default function StickyPlanBar({ sentinelId }: StickyPlanBarProps) {
  const [show, setShow] = useState(false);
  const { setStickyPlanVisible } = useStickyPlanBar();
  const overlaysBlock = useBlockingOverlaysActive();
  const tCommon = useTranslations("common");

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    const footerSentinel = document.getElementById(FOOTER_SENTINEL_ID);
    if (!sentinel) return;

    let passedPlan = false;
    let footerInView = false;
    let isMounted = true;

    const updateShow = () => {
      if (isMounted) setShow(passedPlan && !footerInView);
    };

    const planObserver = new IntersectionObserver(
      ([entry]) => {
        passedPlan = !entry.isIntersecting && entry.boundingClientRect.top < 0;
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

    planObserver.observe(sentinel);
    if (footerSentinel && footerObserver) footerObserver.observe(footerSentinel);

    return () => {
      isMounted = false;
      planObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [sentinelId]);

  useEffect(() => {
    setStickyPlanVisible(show);
    return () => setStickyPlanVisible(false);
  }, [show, setStickyPlanVisible]);

  if (!show || overlaysBlock) return null;

  return (
    <div
      className={`fixed left-0 right-0 ${LAYOUT.fixedBottomAboveNavCookie} ${LAYER.stickyPlaceBar} flex items-center justify-center pt-4 ${LAYOUT.safeAreaX} pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-sand-200/80 ${LAYOUT.mobileBottomChromeHidden}`}
      role="complementary"
      aria-label={tCommon("planYourTrip")}
    >
      <AppLink
        href="/plan"
        className={`${CTA.primary} max-w-md`}
      >
        {tCommon("planYourTrip")}
      </AppLink>
    </div>
  );
}
