"use client";

import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import type { SearchResult } from "@/lib/search";
import { CARD, TYPE } from "@/lib/design-tokens";

const kindLabels: Record<string, string> = {
  place: "Place",
  trail: "Trail",
  event: "Event",
};

const kindBadge: Record<string, string> = {
  place: "bg-terracotta/20 text-terracotta",
  trail: "bg-aegean/20 text-aegean",
  event: "bg-golden/20 text-charcoal",
};

export default function SearchResultCard({ result }: { result: SearchResult }) {
  const name = result.item.name;
  const region = result.item.region;
  const kind = result.kind;
  const sublabel = kind === "event" ? (result.item as { month: string }).month : region;
  const badge = kindBadge[kind] ?? "bg-sand-100 text-olive/80";

  return (
    <div className={`group rounded-2xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.content}`}>
      <AppLink
        href={result.href}
        className="block"
        aria-label={`${name}, ${kindLabels[kind]} in ${region}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`${TYPE.cardTitle} truncate`} title={name}>
              {name}
            </h3>
            <p className="text-sm text-olive/70 mt-1 truncate" title={sublabel}>{sublabel}</p>
          </div>
          <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize tracking-[0.01em] ${badge}`}>
            {kindLabels[kind]}
          </span>
        </div>
      </AppLink>
      <div className="mt-4 pt-4 border-t border-sand-200/60">
        <TrackOnClick event="plan_add" properties={{ placeId: result.item.id, source: "search_result_card" }}>
          <AddToItineraryButton placeId={result.item.id} className="text-sm" />
        </TrackOnClick>
      </div>
    </div>
  );
}
