"use client";

import Link from "next/link";
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
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.content}`}>
      <Link
        href={result.href}
        className="block"
        aria-label={`${name}, ${kindLabels[kind]} in ${region}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`${TYPE.cardTitle} truncate`} title={name}>
              {name}
            </h3>
            <p className="text-sm text-olive/70 mt-0.5 truncate" title={sublabel}>{sublabel}</p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge}`}>
            {kindLabels[kind]}
          </span>
        </div>
      </Link>
      <div className="mt-3 pt-3 border-t border-sand-200/60">
        <Link
          href={`/plan?add=${encodeURIComponent(result.item.id)}`}
          className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
          aria-label={`Add ${name} to your plan`}
        >
          Add to plan
        </Link>
      </div>
    </div>
  );
}
