import Link from "next/link";
import { CARD, CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { getRelatedPlaces } from "@/lib/related-places";

type DayCombo = {
  label: string;
  ids: string[];
};

const DAY_COMBOS: DayCombo[] = [
  {
    label: "Limassol coast & Commandaria",
    ids: ["kourion", "governors-beach", "kolossi"],
  },
  {
    label: "Paphos mosaics & wine",
    ids: ["pafos-mosaics", "tomb-of-kings", "vouni-panayia"],
  },
  {
    label: "Troodos village & winery",
    ids: ["omodos", "tsiakkas"],
  },
  {
    label: "Larnaca corridor · lace, ancient & wine",
    ids: ["lefkara", "choirokoitia", "domes-sergiou"],
  },
];

export default function DiscoverDayCombos() {
  return (
    <section
      aria-labelledby="discover-day-combos-heading"
      className={`${SECTION.pySub} ${SECTION.alt} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="discover-day-combos-heading"
          className={`${TYPE.sectionTitle} text-center ${SECTION.headingGap}`}
        >
          Build a day
        </h2>
        <p className="text-olive/80 text-sm text-center max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
          Curated combos that work. Morning at one place, afternoon at another. Add to your plan.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DAY_COMBOS.map((combo) => {
            const places = getRelatedPlaces(combo.ids);
            if (places.length === 0) return null;
            const addIds = places.map((p) => p.id).join(",");
            return (
              <div
                key={combo.label}
                className={`${CARD.base} ${CARD.content} bg-sand-100/90 border-sand-200/80`}
              >
                <h3 className="font-display font-semibold text-charcoal text-sm mb-3">
                  {combo.label}
                </h3>
                <ul className="space-y-2 mb-4">
                  {places.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={p.href}
                        className="text-sm text-olive/90 hover:text-terracotta transition-colors"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/plan?add=${addIds}`}
                  className={`text-sm ${CTA.primaryCompact}`}
                  aria-label={`Add ${combo.label} to plan`}
                >
                  Add to plan
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
