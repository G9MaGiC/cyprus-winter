"use client";

import { useRouter } from "@/i18n/navigation";
import { resolveInternalPath } from "@/lib/resolve-internal-path";
import { useTranslations } from "next-intl";

type Card = {
  type: string;
  id: string;
  title: string;
  reason: string;
};

export function PlaceCards({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const tCommon = useTranslations("common");

  function typeLabel(type: string): string {
    if (type === "trail") return tCommon("placeTypes.trail");
    if (type === "winery") return tCommon("placeTypes.winery");
    if (type === "event") return tCommon("placeTypes.event");
    return tCommon("place");
  }

  function handleClick(card: Card) {
    if (card.type === "event") {
      router.push("/events");
      return;
    }
    const basePath = card.type === "trail" ? "/trails" : "/discover";
    router.push(resolveInternalPath(`${basePath}/${card.id}`));
  }

  if (!Array.isArray(cards) || !cards.length) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => handleClick(card)}
          className="flex items-start gap-2 p-2 rounded-lg bg-sand-100/80 hover:bg-sand-200/70 transition-colors text-start w-full min-h-[44px] py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="shrink-0 mt-0.5 text-xs font-medium text-muted-ink uppercase tracking-wide w-12">
            {typeLabel(card.type)}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-charcoal truncate">{card.title}</div>
            <div className="text-xs text-muted-ink line-clamp-1">{card.reason}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
