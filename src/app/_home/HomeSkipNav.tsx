"use client";

import AppLink from "@/components/AppLink";
import { LAYER } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function HomeSkipNav() {
  const tCommon = useTranslations("common");

  return (
    <nav
      aria-label={tCommon("skipToContent")}
      className={`absolute left-4 top-4 ${LAYER.popover} flex -translate-y-full flex-col gap-2 rounded-lg border border-sand-200 bg-white p-2 shadow-lg transition-transform focus-within:translate-y-0 focus-within:outline-none focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2`}
    >
      <AppLink
        href="#start-here"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        {tCommon("skipTo.startHere")}
      </AppLink>
      <AppLink
        href="#this-week-heading"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        {tCommon("skipTo.thisWeek")}
      </AppLink>
      <AppLink
        href="#editors-picks-heading"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        {tCommon("skipTo.editorsPicks")}
      </AppLink>
      <AppLink
        href="#planning-section"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        {tCommon("skipTo.plan")}
      </AppLink>
    </nav>
  );
}
