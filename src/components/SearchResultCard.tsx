import Link from "next/link";
import type { SearchResult } from "@/lib/search";
import { CARD } from "@/lib/design-tokens";

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
    <Link
      href={result.href}
      className={`block group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.link} ${CARD.content}`}
      aria-label={`${name}, ${kindLabels[kind]} in ${region}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-olive group-hover:text-terracotta transition-colors truncate" title={name}>
            {name}
          </h3>
          <p className="text-sm text-olive/70 mt-0.5 truncate">{sublabel}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge}`}>
          {kindLabels[kind]}
        </span>
      </div>
    </Link>
  );
}
