import Link from "next/link";
import { CARD, CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

type StartHereItem = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  variant: "primary" | "secondary";
};

const items: StartHereItem[] = [
  {
    title: "Discover",
    desc: "Places that feel real. Ruins, coasts, villages, heritage.",
    href: "/discover",
    cta: "Start exploring",
    variant: "primary",
  },
  {
    title: "Plan",
    desc: "Save picks as you go. No account needed.",
    href: "/plan",
    cta: "Build itinerary",
    variant: "secondary",
  },
  {
    title: "Book",
    desc: "Reserve tastings before weekends fill.",
    href: "/wineries",
    cta: "Book tastings",
    variant: "secondary",
  },
];

export default function StartHereStrip() {
  return (
    <section aria-label="Start here" className={`${LAYOUT.safeAreaX} ${SECTION.pySub} ${SECTION.alt} relative z-20 min-h-0`}>
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex flex-col ${CARD.base} ${CARD.hover} ${CARD.interactive} ${CARD.link} overflow-hidden ${
                item.variant === "primary"
                  ? "border-l-4 border-l-terracotta min-h-[160px] sm:min-h-[180px]"
                  : "border-l-4 border-l-aegean/60"
              }`}
              aria-label={`${item.title}: ${item.desc}`}
            >
              <div className={`flex-1 ${CARD.content}`}>
                <p className={`${TYPE.kicker} mb-2`}>Start here</p>
                <p className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                  {item.title}
                </p>
                <p className="text-sm text-olive/70 mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
              <div className={CARD.footer}>
                <span
                  className={`inline-block ${item.variant === "primary" ? CTA.primaryCompact : CTA.secondaryCompact}`}
                >
                  {item.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

