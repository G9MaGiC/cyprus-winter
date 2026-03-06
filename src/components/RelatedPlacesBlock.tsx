import Link from "next/link";
import { CARD } from "@/lib/design-tokens";
import { getRelatedPlaces } from "@/lib/related-places";

type RelatedPlacesBlockProps = {
  ids: string[];
  description: string;
  /** When true, show "Add to plan" link next to each place */
  showAddToItinerary?: boolean;
};

export default function RelatedPlacesBlock({ ids, description, showAddToItinerary = false }: RelatedPlacesBlockProps) {
  const related = getRelatedPlaces(ids);
  if (related.length === 0) return null;

  return (
    <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/70`}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-olive/70 mb-3 flex items-center gap-2">
        Pair well with
      </h2>
      <p className="text-olive/80 text-base mb-4 leading-relaxed break-words">
        {description}
      </p>
      <ul className="flex flex-wrap gap-2">
        {related.map((r) => (
          <li key={r.id} className="min-w-0 flex flex-wrap items-center gap-2">
            <Link
              href={r.href}
              className="group inline-flex items-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-lg bg-sand-100/80 border border-sand-200/70 text-olive font-medium text-sm hover:bg-terracotta hover:text-white hover:border-terracotta/30 transition-colors duration-150 max-w-full min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="truncate">{r.name}</span>
              <span className="text-terracotta/80 group-hover:text-white shrink-0 transition-colors" aria-hidden>→</span>
            </Link>
            {showAddToItinerary && (
              <Link
                href={`/plan?add=${r.id}`}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-terracotta bg-terracotta/10 hover:bg-terracotta/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                title={`Add ${r.name} to plan`}
                aria-label={`Add ${r.name} to plan`}
              >
                Add to plan
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
