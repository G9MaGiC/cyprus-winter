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
          Open
        </span>
      );
    case "caution":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-charcoal ${badgeOverlay}`} title={tBadges("status.caution.title")}>
          <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
          Caution
        </span>
      );
    case "closed":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-terracotta ${badgeOverlay}`} title={tBadges("status.closed.title")}>
          <span className="w-2 h-2 rounded-full bg-terracotta/80" aria-hidden />
          Closed
        </span>
      );
    default:
      return null;
  }
}

const DIFFICULTY_TIPS: Record<TrailDifficulty, string> = {
  easy: "Easy underfoot, good for families. Allow time to enjoy the views.",
  moderate: "Some elevation and distance. Allow 2 to 3 hours. Layer up for the summit.",
  hard: "Steep sections and longer distance. Allow 3 to 4 hours. Check conditions before you go.",
  expert: "Technical terrain, full day. Experience and preparation required.",
};

const difficultyTextColors: Record<TrailDifficulty, string> = {
  easy: "text-aegean",
  moderate: "text-charcoal",
  hard: "text-terracotta",
  expert: "text-charcoal",
};

export function DifficultyBadge({ difficulty }: { difficulty: TrailDifficulty }) {
  return (
    <span
      title={DIFFICULTY_TIPS[difficulty]}
      className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize backdrop-blur-sm bg-white/85 ${difficultyTextColors[difficulty] ?? "text-olive/80"}`}
    >
      {difficulty}
    </span>
  );
}
