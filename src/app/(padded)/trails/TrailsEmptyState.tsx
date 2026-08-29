"use client";

import AppLink from "@/components/AppLink";
import AskAIButton from "@/components/AskAIButton";
import { CTA, EMPTY_STATE_LARGE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TrailsEmptyState() {
  const t = useTranslations();

  return (
    <div
      className={`${EMPTY_STATE_LARGE} max-w-md mx-auto`}
      role="status"
      aria-live="polite"
    >
      <p className="text-muted-ink leading-relaxed break-words mb-6">
        {t("trails.emptyState.body")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/trails" className={`inline-flex justify-center min-w-[140px] ${CTA.primaryCompact}`}>
          {t("trails.emptyState.ctaAllTrails")}
        </AppLink>
        <AskAIButton
          className={CTA.secondaryCompact}
          ariaLabel={t("common.askAITrailsAria")}
        />
        <AppLink href="/discover" className={CTA.secondaryCompact}>
          {t("nav.discover")}
        </AppLink>
      </div>
    </div>
  );
}
