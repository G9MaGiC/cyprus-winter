import { CARD } from "@/lib/design-tokens";

export default function WhyCyprusDetails() {
  return (
    <details className="group">
      <summary className="list-none cursor-pointer min-h-[48px] py-4 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl transition-colors hover:text-terracotta">
        <h2
          id="why-cyprus-heading"
          className="font-display text-2xl sm:text-3xl font-semibold text-charcoal leading-tight break-words inline-flex items-center justify-center gap-2"
        >
          Why Cyprus in winter
          <span className="text-sage text-lg transition-transform duration-200 group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </h2>
      </summary>

      <div className="mt-10 max-w-2xl mx-auto">
        <div className={`${CARD.base} ${CARD.content} rounded-2xl`}>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-olive/80">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta/70" aria-hidden />
              Coast often 16–20°C
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-aegean/70" aria-hidden />
              Troodos cooler — check conditions
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-golden/80" aria-hidden />
              Sunset ~5pm in December
            </span>
          </div>

          <blockquote className="mt-8 text-center text-olive text-base sm:text-lg leading-relaxed prose-quote">
            Coast mild. Mountains with snow. Hike in the morning, lunch outside. Ancient sites empty, villages quiet.
            Stop at a kafenion. Coffee. Nobody hurries.
          </blockquote>
          <p className="mt-6 text-center text-sm text-sage">
            A small rule: pick one trail, one village, one tasting. Add them to your plan as you go.
          </p>
        </div>
      </div>
    </details>
  );
}

