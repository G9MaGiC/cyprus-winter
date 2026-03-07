import Link from "next/link";
import { CARD, CTA, LAYOUT, TYPE } from "@/lib/design-tokens";

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
    desc: "Villages, ruins, coasts, wineries.",
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
    <section aria-label="Start here" className={`${LAYOUT.safeAreaX} -mt-10 sm:-mt-14 relative z-20`}>
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group ${CARD.base} ${CARD.hover} ${CARD.interactive} ${CARD.link} ${CARD.content}`}
              aria-label={`${item.title}: ${item.desc}`}
            >
              <p className={`${TYPE.kicker} mb-2`}>Start here</p>
              <p className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                {item.title}
              </p>
              <p className="text-sm text-olive/70 mt-1 leading-relaxed">{item.desc}</p>
              <div className="mt-4">
                <span className={item.variant === "primary" ? CTA.primaryCompact : CTA.secondaryCompact}>
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

