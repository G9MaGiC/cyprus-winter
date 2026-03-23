import { CARD, TYPE } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

export default async function WhyCyprusDetails() {
  const tHome = await getTranslations("home");
  return (
    <details className="group" open>
      <summary className="list-none cursor-pointer min-h-[44px] py-5 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl transition-colors hover:text-terracotta">
        <h2
          id="why-cyprus-heading"
          className={`${TYPE.sectionTitle} inline-flex items-center justify-center gap-2`}
        >
          {tHome("whyCyprus.heading")}
          <svg className="w-5 h-5 text-sage transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </h2>
      </summary>

      <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
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
            {tHome("whyCyprus.quote")}
          </blockquote>
          <p className="mt-6 text-center text-sm text-sage">
            {tHome("whyCyprus.rule")}
          </p>
          <p className="mt-4 text-center text-sm font-medium text-olive/90">
            {tHome("whyCyprus.tagline")}
          </p>
        </div>
      </div>
    </details>
  );
}

