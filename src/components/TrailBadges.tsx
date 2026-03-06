import type { TrailStatus, TrailDifficulty } from "@/data/trails";

export function StatusBadge({ status }: { status: TrailStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean" title="Good to go">
          <span className="w-2 h-2 rounded-full bg-aegean/70" aria-hidden />
          Open
        </span>
      );
    case "caution":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-golden/30 text-charcoal" title="Check conditions before you head out">
          <span className="w-2 h-2 rounded-full bg-golden" aria-hidden />
          Caution
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-terracotta/20 text-terracotta" title="Best saved for another day">
          <span className="w-2 h-2 rounded-full bg-terracotta/70" aria-hidden />
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

export function DifficultyBadge({ difficulty }: { difficulty: TrailDifficulty }) {
  const colors: Record<TrailDifficulty, string> = {
    easy: "bg-aegean/20 text-aegean",
    moderate: "bg-golden/30 text-charcoal",
    hard: "bg-terracotta/20 text-terracotta",
    expert: "bg-terracotta/30 text-charcoal",
  };
  return (
    <span
      title={DIFFICULTY_TIPS[difficulty]}
      className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${colors[difficulty] ?? "bg-sand-200/60 text-olive/80"}`}
    >
      {difficulty}
    </span>
  );
}
