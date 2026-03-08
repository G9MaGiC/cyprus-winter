import Link from "next/link";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { getRelatedPlaces } from "@/lib/related-places";
import { DAY_COMBOS } from "@/data/day-combos";
import type { RelatedPlace } from "@/lib/related-places";

function typeBadge(type: RelatedPlace["type"]) {
  const labels: Record<RelatedPlace["type"], string> = {
    trail: "Trail",
    winery: "Winery",
    attraction: "Place",
    restaurant: "Eat",
    event: "Event",
  };
  const cls: Record<RelatedPlace["type"], string> = {
    trail: "bg-sage/15 text-sage",
    winery: "bg-golden/15 text-golden",
    attraction: "bg-aegean/15 text-aegean",
    restaurant: "bg-sand-200/80 text-olive/80",
    event: "bg-olive/10 text-olive",
  };
  const label = labels[type];
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${cls[type]}`}
      aria-hidden
    >
      {label}
    </span>
  );
}

export default function BuildADaySection() {
  return (
    <section
      aria-labelledby="build-a-day-heading"
      className={`${SECTION.pySub} rounded-2xl ${SECTION.alt}`}
    >
      <header>
        <p id="build-a-day-kicker" className={`${TYPE.kicker} mb-1.5`}>
          Curated combos
        </p>
        <h2 id="build-a-day-heading" className={`${TYPE.sectionTitle} tracking-tight ${SECTION.titleGap}`}>
          Build a day
        </h2>
        <p className={`text-sm text-olive/70 max-w-xl break-words leading-relaxed ${SECTION.headingGap}`}>
          Morning at one place, afternoon at another. These flow.
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DAY_COMBOS.map((combo) => {
          const places = getRelatedPlaces(combo.ids);
          if (places.length === 0) return null;
          const addIds = places.map((p) => p.id).join(",");
          return (
            <article
              key={combo.label}
              className={`${CARD.base} ${CARD.content} ${CARD.hover} ${CARD.interactive} bg-white/95 border-sand-200/80 flex flex-col group transition-all duration-200`}
            >
              <h3 className="font-display font-semibold text-charcoal text-base mb-1.5 group-hover:text-terracotta transition-colors duration-200">
                {combo.label}
              </h3>
              <p className="text-sm text-olive/70 mb-3 leading-relaxed">
                {combo.why}
              </p>
              {combo.tip && (
                <p className="text-xs text-olive/60 mb-3 italic border-l-2 border-l-golden/40 pl-2.5">
                  {combo.tip}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-olive/50 mb-3 uppercase tracking-wider" aria-hidden>
                <span>Morning</span>
                <span aria-hidden>→</span>
                <span>Afternoon</span>
              </div>
              <ul className="space-y-2 mb-4 flex-1">
                {places.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 min-w-0">
                    {typeBadge(p.type)}
                    <Link
                      href={p.href}
                      className="min-w-0 truncate text-sm text-olive/90 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-1 rounded min-h-[44px] inline-flex items-center -my-1 py-1"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/plan?add=${addIds}`}
                className={`w-full ${CTA.primaryCompact} transition-transform duration-150 active:scale-[0.98] motion-reduce:active:scale-100`}
                aria-label={`Add ${combo.label} to plan`}
              >
                Add to plan
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
