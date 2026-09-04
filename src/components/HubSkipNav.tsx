"use client";

import AppLink from "@/components/AppLink";
import { LAYER } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type HubSkipTarget = {
  href: string;
  labelKey: "results" | "map";
};

/**
 * Hub variant of HomeSkipNav (AUD-27): the big list hubs put ~26–30 tab stops
 * (hero CTAs, search, filter chips) between the nav and the first card, and
 * the global skip link only reaches #main-content. Hidden until focused,
 * revealed as a panel of in-page jump links.
 */
export default function HubSkipNav({ targets }: { targets: HubSkipTarget[] }) {
  const tCommon = useTranslations("common");

  return (
    <nav
      aria-label={tCommon("skipToContent")}
      className={`absolute start-4 top-4 ${LAYER.popover} flex -translate-y-full flex-col gap-2 rounded-lg border border-sand-200 bg-white p-2 shadow-lg transition-transform focus-within:translate-y-0 focus-within:outline-none focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2`}
    >
      {targets.map(({ href, labelKey }) => (
        <AppLink
          key={href}
          href={href}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          {tCommon(`skipTo.${labelKey}`)}
        </AppLink>
      ))}
    </nav>
  );
}
