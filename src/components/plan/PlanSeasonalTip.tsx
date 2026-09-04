"use client";

import { ITINERARY_TEMPLATES, type TemplateKey } from "@/data/itinerary-templates";
import { TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

/**
 * One-shot pacing tip shown after a template is applied: `seasonalNote` was
 * curated in the data since day one (daylight windows, icy-trail warnings,
 * rainy-day swaps) but never rendered anywhere. Session-only by design — the
 * advice matters at the moment the itinerary lands, not on every visit.
 */
export default function PlanSeasonalTip({
  templateKey,
  onDismiss,
}: {
  templateKey: TemplateKey;
  onDismiss: () => void;
}) {
  const tPlanQuick = useTranslations("planQuick");
  const template = ITINERARY_TEMPLATES.find((t) => t.key === templateKey);
  if (!template?.seasonalNote) return null;

  return (
    <div className="rounded-xl border border-aegean/20 bg-aegean/5 p-3 sm:p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`${TYPE.kicker} text-aegean`}>{tPlanQuick("seasonalTip.kicker")}</p>
        <p className="mt-1 text-sm text-olive/85 break-words leading-relaxed">
          {tPlanQuick(
            `templates.items.${templateKey}.seasonalNote` as "templates.items.short-stay.label"
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={tPlanQuick("seasonalTip.dismissAria")}
        className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded text-muted-ink hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
      >
        <span aria-hidden>✕</span>
      </button>
    </div>
  );
}
