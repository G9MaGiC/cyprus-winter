"use client";

import AppLink from "@/components/AppLink";
import { CTA, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function PlanWineryBar() {
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("bookings");
  const tPlan = useTranslations("plan.wineryBar");
  return (
    <div
      role="region"
      aria-label={tPlan("ariaLabel")}
      className="rounded-2xl border border-sand-200/90 bg-white/90 p-5 sm:p-6 flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px] shadow-sm"
    >
      <AppLink href="/book/winery" className={CTA.primaryCompact}>
        {tCommon("bookTastings")}
      </AppLink>
      <AppLink href="/discover?filter=winery" className={CTA.secondaryCompact}>
        {tBookings("browseWineries")}
      </AppLink>
      <AppLink href="/bookings" className={SECTION.aegeanLink}>
        {tBookings("title")}
      </AppLink>
    </div>
  );
}
