"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppLink from "@/components/AppLink";
import { useItinerary } from "@/hooks/useItinerary";
import { useBlockingOverlaysActive } from "@/hooks/useBlockingOverlaysActive";
import { useStickyPlanBar } from "@/contexts/StickyPlanBarContext";
import { CTA, LAYER, LAYOUT } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

function isHomePath(pathname: string): boolean {
  return pathname === "/" || /^\/[a-z]{2}$/i.test(pathname);
}

/**
 * Floating chip on home when the user has places in their plan.
 */
export default function TripPlanSummaryChip() {
  const pathname = usePathname();
  const t = useTranslations("common.tripPlanSummary");
  const { days, hydrated } = useItinerary();
  const overlaysBlock = useBlockingOverlaysActive();
  const { stickyPlanVisible } = useStickyPlanBar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted || !hydrated || !isHomePath(pathname) || overlaysBlock || stickyPlanVisible) return null;

  const totalPlaces = Object.values(days).flat().length;
  if (totalPlaces <= 0) return null;

  return (
    <div
      className={`fixed left-1/2 ${LAYER.popover} -translate-x-1/2 ${LAYOUT.fixedBottomAboveNavCookie} ${LAYOUT.mobileBottomChromeHidden} md:bottom-6 px-4 w-full max-w-md pointer-events-none`}
    >
      <AppLink
        href="/plan"
        className={`${CTA.primaryCompact} pointer-events-auto shadow-lg w-full justify-center gap-2`}
        aria-label={t("aria")}
      >
        <span className="font-medium">{t("places", { count: totalPlaces })}</span>
        <span className="text-white/90">· {t("viewPlan")}</span>
      </AppLink>
    </div>
  );
}
