"use client";

import type { TrailStatus, TrailDifficulty } from "@/data/trails";
import { BADGE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export function StatusBadge({ status }: { status: TrailStatus }) {
  const tBadges = useTranslations("trails.badges");
  switch (status) {
    case "open":
      return (
        <span className={`${BADGE.base} ${BADGE.chip} gap-1.5 text-aegean`} title={tBadges("status.open.title")}>
          <span className="w-2 h-2 rounded-full bg-aegean/80" aria-hidden />
          {tBadges("status.open.label")}
        </span>
      );
    case "caution":
      return (
        <span className={`${BADGE.base} ${BADGE.chip} gap-1.5 text-charcoal`} title={tBadges("status.caution.title")}>
          <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
          {tBadges("status.caution.label")}
        </span>
      );
    case "closed":
      return (
        <span className={`${BADGE.base} ${BADGE.chip} gap-1.5 text-terracotta`} title={tBadges("status.closed.title")}>
          <span className="w-2 h-2 rounded-full bg-terracotta/80" aria-hidden />
          {tBadges("status.closed.label")}
        </span>
      );
    default:
      return null;
  }
}

const difficultyTextColors: Record<TrailDifficulty, string> = {
  easy: "text-aegean",
  moderate: "text-charcoal",
  hard: "text-terracotta",
  expert: "text-charcoal",
};

export function DifficultyBadge({ difficulty }: { difficulty: TrailDifficulty }) {
  const tBadges = useTranslations("trails.badges");
  return (
    <span
      title={tBadges(`difficulty.${difficulty}.tip`)}
      className={`${BADGE.base} ${BADGE.chip} ${difficultyTextColors[difficulty] ?? "text-muted-ink"}`}
    >
      {tBadges(`difficulty.${difficulty}.label`)}
    </span>
  );
}
