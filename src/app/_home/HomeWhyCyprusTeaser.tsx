import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";

/**
 * Emotional blockquote surfaced early in the home scroll.
 * Surfaces the Why Cyprus payoff before the discovery sections.
 */
export default function HomeWhyCyprusTeaser() {
  return (
    <section
      aria-labelledby="why-winter-teaser"
      className={`${SECTION.pySub} bg-sand/50 ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.listNarrow} mx-auto`}>
        <blockquote
          id="why-winter-teaser"
          className={`${CARD.base} ${CARD.content} rounded-2xl border-l-4 border-l-sage/50 text-center`}
        >
          <p className="text-olive text-base sm:text-lg leading-relaxed prose-quote">
            Hike in the morning, lunch outside. Ancient sites empty, villages quiet. Nobody hurries.
          </p>
        </blockquote>
      </div>
    </section>
  );
}
