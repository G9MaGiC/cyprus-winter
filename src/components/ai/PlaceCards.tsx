"use client";

import { useRouter } from "@/i18n/navigation";

type Card = {
  type: string;
  id: string;
  title: string;
  reason: string;
};

const TYPE_LABELS: Record<string, string> = {
  trail: "Trail",
  winery: "Winery",
  event: "Event",
  place: "Place",
};

export function PlaceCards({ cards }: { cards: Card[] }) {
  const router = useRouter();

  function handleClick(card: Card) {
    const basePath = card.type === "trail" ? "/trails" : "/discover";
    router.push(`${basePath}/${card.id}`);
  }

  if (!Array.isArray(cards) || !cards.length) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => handleClick(card)}
            className="flex items-start gap-2 p-2 rounded-lg bg-sand-100/80 hover:bg-sand-200/70 transition-colors text-left w-full min-h-[44px] py-3"
        >
          <span className="shrink-0 mt-0.5 text-xs font-medium text-olive/60 uppercase tracking-wide w-12">
            {TYPE_LABELS[card.type] ?? "Place"}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-charcoal truncate">{card.title}</div>
            <div className="text-xs text-olive/70 line-clamp-1">{card.reason}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
