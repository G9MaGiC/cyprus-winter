import AppLink from "@/components/AppLink";
import { CARD, SECTION, TYPE } from "@/lib/design-tokens";
import { discoverDetailHref } from "@/lib/discover-links";
import { getRelatedPlaces } from "@/lib/related-places";

type RelatedPlacesBlockProps = {
  ids: string[];
  title: string;
  description: string;
  /** When set, discover place links keep filter context for back navigation. */
  discoverFilter?: string | null;
  /** When true, show "Add to plan" link next to each place */
  showAddToItinerary?: boolean;
  addToPlanLabel?: string;
  addToPlanAria?: (name: string) => string;
};

function resolveHref(
  href: string,
  placeId: string,
  discoverFilter?: string | null
): string {
  if (discoverFilter && href.startsWith("/discover/")) {
    return discoverDetailHref(placeId, discoverFilter);
  }
  return href;
}

export default function RelatedPlacesBlock({
  ids,
  title,
  description,
  discoverFilter,
  showAddToItinerary = false,
  addToPlanLabel = "Add to plan",
  addToPlanAria = (name) => `Add ${name} to plan`,
}: RelatedPlacesBlockProps) {
  const related = getRelatedPlaces(ids);
  if (related.length === 0) return null;

  return (
    <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90`}>
      <h2 className={`${TYPE.kicker} text-muted-ink ${SECTION.titleGap} flex items-center gap-2`}>
        {title}
      </h2>
      <p className={`text-muted-ink text-base ${SECTION.headingGap} leading-relaxed break-words`}>
        {description}
      </p>
      <ul className="flex flex-wrap gap-2">
        {related.map((r) => (
          <li key={r.id} className="min-w-0 flex flex-wrap items-center gap-2">
            <AppLink
              href={resolveHref(r.href, r.id, discoverFilter)}
              className="group inline-flex items-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-xl bg-sand-100/80 border border-sand-200/80 text-olive font-medium text-sm hover:bg-terracotta-muted hover:text-white hover:border-terracotta/30 transition-colors duration-150 max-w-full min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="truncate">{r.name}</span>
              <span className="text-terracotta group-hover:text-white shrink-0 transition-colors" aria-hidden>→</span>
            </AppLink>
            {showAddToItinerary && (
              <AppLink
                href={`/plan?add=${r.id}`}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-terracotta bg-terracotta/10 hover:bg-terracotta/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={addToPlanAria(r.name)}
              >
                {addToPlanLabel}
              </AppLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
