"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LAYOUT, SECTION } from "@/lib/design-tokens";

type PlanFooterProps = {
  hasWineries?: boolean;
  /** Show account CTA when plan has 2+ items (conversion moment) */
  showAccountCTA?: boolean;
};

export default function PlanFooter({ hasWineries, showAccountCTA }: PlanFooterProps) {
  const tOnboarding = useTranslations("onboarding");
  const tPlan = useTranslations("plan");
  return (
    <footer
      className={`${SECTION.footerBlock} pt-12 sm:pt-14 ${LAYOUT.footerBottomClearance}`}
    >
      {showAccountCTA && (
        <p className="text-center mb-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg text-sm font-medium text-aegean hover:text-aegean/80 border border-aegean/50 hover:border-aegean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2"
            aria-label={tPlan("aria.savePlanCta")}
          >
            {tOnboarding("savePlan")}
          </Link>
        </p>
      )}
      <p className="text-olive/60 text-sm break-words text-center mb-6 max-w-xl mx-auto leading-relaxed">
        Winter tip: daylight fades around 5pm. Start trails by 10am and book tastings 24-48h ahead.
      </p>
      <div
        className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm"
        role="navigation"
        aria-label={tPlan("aria.quickLinks")}
      >
        {hasWineries && (
          <Link href="/bookings" className={SECTION.aegeanLink}>
            Book tastings
          </Link>
        )}
        <Link href="/discover" className={SECTION.aegeanLink}>
          Discover
        </Link>
        <Link href="/trails" className={SECTION.aegeanLink}>
          Trails
        </Link>
        <Link href="/weather" className={SECTION.aegeanLink}>
          Weather
        </Link>
      </div>
    </footer>
  );
}
