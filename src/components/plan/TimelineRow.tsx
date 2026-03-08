"use client";

import { type RefObject } from "react";
import ItineraryCard from "@/components/ItineraryCard";
import { CARD } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";

type TimelineRowProps = {
  id: string;
  index: number;
  showConnector: boolean;
  lastAddedId: string | null;
  lastAddedCardRef: RefObject<HTMLDivElement | null>;
  getPlace: (id: string) => PlanItem | undefined;
  removeFromDay: (id: string) => void;
};

export default function TimelineRow({
  id,
  index,
  showConnector,
  lastAddedId,
  lastAddedCardRef,
  getPlace,
  removeFromDay,
}: TimelineRowProps) {
  const p = getPlace(id);
  if (!p) {
    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center shrink-0">
          <span className="w-8 h-8 rounded-full bg-sand-200/80 text-olive/50 flex items-center justify-center text-sm font-semibold">
            {index}
          </span>
          {showConnector && <span className="w-px h-4 sm:h-5 bg-sand-200/70 mt-2 shrink-0 min-w-[1px]" aria-hidden />}
        </div>
        <div className={`flex-1 flex items-center justify-between ${CARD.content} rounded-xl border border-sand-200/80 bg-sand-100/50`}>
          <span className="text-sm text-olive/60 italic">This place was removed from our list</span>
          <button
            type="button"
            onClick={() => removeFromDay(id)}
            className="min-h-[44px] px-3 py-2 text-sm font-medium text-olive/70 hover:text-terracotta rounded-lg hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Remove"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }
  const isLastAdded = lastAddedId === id;
  return (
    <div ref={isLastAdded ? lastAddedCardRef : undefined} className="flex gap-4 transition-opacity duration-200">
      <div className="flex flex-col items-center shrink-0">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-200 ${
            isLastAdded
              ? "bg-terracotta text-white ring-2 ring-terracotta/40 ring-offset-2 ring-offset-white"
              : "bg-sand-200/80 text-olive/70"
          }`}
        >
          {index}
        </span>
        {showConnector && <span className="w-px h-4 sm:h-5 bg-sand-200/70 mt-2 shrink-0 min-w-[1px]" aria-hidden />}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <ItineraryCard
          place={p}
          onRemove={() => removeFromDay(id)}
          lastAdded={isLastAdded}
          index={index}
          cardRef={undefined}
          inTimeline
        />
      </div>
    </div>
  );
}
