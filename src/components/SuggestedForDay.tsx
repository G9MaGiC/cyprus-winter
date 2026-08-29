"use client";

import { useMemo } from "react";
import { CARD } from "@/lib/design-tokens";
import { getRelatedPlaces, getCombineWith } from "@/lib/related-places";
import { useTranslations } from "next-intl";
type SuggestedForDayProps = {
  activeDayItems: string[];
  onAdd: (id: string) => void;
  /** When true, no inner card or heading (used inside a parent card) */
  embedded?: boolean;
};

/**
 * Shows places that pair well with what's already in the day.
 * Based on combineWith from trails, wineries, attractions.
 */
export default function SuggestedForDay({
  activeDayItems,
  onAdd,
  embedded = false,
}: SuggestedForDayProps) {
  const t = useTranslations("plan.suggestedForDay");
  const suggested = useMemo(() => {
    const ids = new Set<string>();
    for (const id of activeDayItems) {
      for (const combined of getCombineWith(id)) {
        if (!activeDayItems.includes(combined)) ids.add(combined);
      }
    }
    return Array.from(ids);
  }, [activeDayItems]);

  const related = useMemo(() => getRelatedPlaces(suggested), [suggested]);

  if (activeDayItems.length === 0) {
    return (
      <p className={embedded ? "text-xs text-muted-ink" : "mb-4 text-xs text-muted-ink"}>
        {t("empty")}
      </p>
    );
  }

  if (related.length === 0) return null;

  const content = (
    <>
      {!embedded && (
        <span className="text-xs font-semibold text-aegean uppercase tracking-wider block mb-2">{t("pairWith")}</span>
      )}
      <p className="text-xs text-muted-ink mb-3">
        {t("worksWell")}
      </p>
      <div className="flex flex-wrap gap-2">
        {related.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onAdd(r.id)}
            aria-label={t("addToDayAria", { name: r.name })}
            className="inline-flex items-center min-h-[44px] gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-sand-200/80 text-olive hover:border-aegean/40 hover:bg-aegean/10 hover:text-aegean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="truncate max-w-[140px]">{r.name}</span>
            <span className="text-aegean/80 shrink-0">+</span>
          </button>
        ))}
      </div>
    </>
  );

  if (embedded) return content;
  return (
    <div className={`mb-5 ${CARD.base} ${CARD.content} bg-aegean/5 border-aegean/20`}>
      {content}
    </div>
  );
}
