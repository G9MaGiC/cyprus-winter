"use client";

import type { TrailStatus, TrailDifficulty } from "@/data/trails";
import { useTranslations } from "next-intl";

const badgeOverlay = "backdrop-blur-sm bg-white/85";

export function StatusBadge({ status }: { status: TrailStatus }) {
  const tBadges = useTranslations("trails.badges");
  switch (status) {
    case "open":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-aegean ${badgeOverlay}`} title={tBadges("status.open.title")}>
          <span className="w-2 h-2 rounded-full bg-aegean/80" aria-hidden />
          {tBadges("status.open.label")}
        </span>
      );
    case "caution":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-charcoal ${badgeOverlay}`} title={tBadges("status.caution.title")}>
          <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
          {tBadges("status.caution.label")}
        </span>
      );
    case "closed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-terracotta ${badgeOverlay}`} title={tBadges("status.closed.title")}>
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
      className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm bg-white/85 ${difficultyTextColors[difficulty] ?? "text-olive/80"}`}
    >
      {tBadges(`difficulty.${difficulty}.label`)}
    </span>
  );
}
