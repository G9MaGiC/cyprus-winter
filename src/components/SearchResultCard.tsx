"use client";

import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { searchResultHref, type SearchResult } from "@/lib/search";
import { CARD, TYPE } from "@/lib/design-tokens";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/localize";

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
  const locale = useLocale();
  const name = getLocalizedName(result.item, locale);
  const region = result.item.region;
  const kind = result.kind;
  const sublabel = kind === "event" ? (result.item as { month: string }).month : region;
  const badge = kindBadge[kind] ?? "bg-sand-100 text-muted-ink";

  const kindLabel =
    kind === "trail"
      ? tCommon("placeTypes.trail")
      : kind === "event"
        ? tCommon("placeTypes.event")
        : tCommon("place");

  const href = searchResultHref(result, searchQuery);

  const ariaLabel = `${name}, ${kindLabel}, ${region}`;

  return (
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.content}`}>
      <AppLink
        href={href}
        className={`block ${CARD.link}`}
        aria-label={ariaLabel}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* line-clamp-1, not truncate: nowrap text sets the grid track's
                min-content to the full line and overflows 320px viewports (AUD R2). */}
            <h3 className={`${TYPE.cardTitle} line-clamp-1 break-words`} title={name}>
              {name}
            </h3>
            <p className="text-sm text-muted-ink mt-0.5 line-clamp-1 break-words" title={sublabel}>{sublabel}</p>
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
