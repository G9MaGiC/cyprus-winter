"use client";

import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { createSearchResultLink } from "@/lib/discover-links";
import type { SearchResult } from "@/lib/search";
import { CARD, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

const kindBadge: Record<string, string> = {
  place: "bg-terracotta/20 text-terracotta",
  trail: "bg-aegean/20 text-aegean",
  event: "bg-golden/20 text-charcoal",
};

type Props = {
  result: SearchResult;
  /** When set, detail links include `from=search&q=` for SmartBackLink. */
  searchQuery?: string;
};

export default function SearchResultCard({ result, searchQuery }: Props) {
  const tCommon = useTranslations("common");
  const name = result.item.name;
  const region = result.item.region;
  const kind = result.kind;
  const sublabel = kind === "event" ? (result.item as { month: string }).month : region;
  const badge = kindBadge[kind] ?? "bg-sand-100 text-olive/80";

  const kindLabel =
    kind === "trail"
      ? tCommon("trail")
      : kind === "event"
        ? tCommon("event")
        : tCommon("place");

  const href = createSearchResultLink(result.href, result.item.id, searchQuery);

  const ariaLabel = `${name}, ${kindLabel}, ${region}`;

  return (
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.content}`}>
      <AppLink
        href={href}
        className="block"
        aria-label={ariaLabel}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`${TYPE.cardTitle} truncate`} title={name}>
              {name}
            </h3>
            <p className="text-sm text-olive/70 mt-0.5 truncate" title={sublabel}>{sublabel}</p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge}`}>
            {kindLabel}
          </span>
        </div>
      </AppLink>
      <div className="mt-3 pt-3 border-t border-sand-200/60">
        <TrackOnClick event="plan_add" properties={{ placeId: result.item.id, source: "search_result_card" }}>
          <AddToItineraryButton placeId={result.item.id} className="text-sm" />
        </TrackOnClick>
      </div>
    </div>
  );
}
