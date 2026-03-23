import { getTranslations } from "next-intl/server";

/** Compact social proof strip shown below the hero. Server component — no JS needed. */
export default async function HomeSocialProof() {
  const tHome = await getTranslations("home");

  const quotes = [
    tHome("socialProof.quote1"),
    tHome("socialProof.quote2"),
    tHome("socialProof.quote3"),
  ];

  return (
    <section
      aria-label={tHome("socialProof.aria")}
      className="bg-sand-200/50 border-y border-sand-200/70 py-3 px-4 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <p className="text-sm font-semibold text-olive/70 shrink-0 whitespace-nowrap">
          {tHome("socialProof.headline")}
        </p>
        <div className="flex gap-4 overflow-x-auto scrollbar-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] w-full sm:w-auto">
          {quotes.map((q, i) => (
            <blockquote
              key={i}
              className="text-xs text-olive/60 italic shrink-0 max-w-[220px] line-clamp-2"
            >
              &ldquo;{q}&rdquo;
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
