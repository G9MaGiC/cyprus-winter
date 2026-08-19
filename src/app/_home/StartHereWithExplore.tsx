"use client";

import AppLink from "@/components/AppLink";
import { CARD, CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type StartHereItem = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  variant: "primary" | "secondary";
};

type Chip = {
  href: string;
  label: string;
  ariaLabel: string;
  variant: "primary" | "secondary" | "tertiary";
};

function chipClass(v: Chip["variant"]) {
  if (v === "primary") return CTA.chipPrimary;
  if (v === "secondary") return CTA.chipSecondary;
  return CTA.chipTertiary;
}

export default function StartHereWithExplore() {
  const tHome = useTranslations("home");
  const startItems: StartHereItem[] = [
    {
      title: tHome("startHere.card.discoverTitle"),
      desc: tHome("startHere.card.discoverDesc"),
      href: "/discover",
      cta: tHome("startHere.card.discoverCta"),
      variant: "primary",
    },
    {
      title: tHome("startHere.card.planTitle"),
      desc: tHome("startHere.card.planDesc"),
      href: "/plan",
      cta: tHome("startHere.card.planCta"),
      variant: "secondary",
    },
    {
      title: tHome("startHere.card.bookTitle"),
      desc: tHome("startHere.card.bookDesc"),
      href: "/wineries",
      cta: tHome("startHere.card.bookCta"),
      variant: "secondary",
    },
  ];

  const categoryChips: Chip[] = [
    { href: "/discover?filter=village", label: tHome("startHere.chip.villages"), ariaLabel: tHome("startHere.chip.villages"), variant: "primary" },
    { href: "/discover?filter=winery", label: tHome("startHere.chip.wineries"), ariaLabel: tHome("startHere.chip.wineries"), variant: "primary" },
    { href: "/trails", label: tHome("startHere.chip.trails"), ariaLabel: tHome("startHere.chip.trailsAria"), variant: "secondary" },
    { href: "/events", label: tHome("startHere.chip.events"), ariaLabel: tHome("startHere.chip.events"), variant: "secondary" },
    { href: "/discover?filter=family", label: tHome("startHere.chip.familyFriendly"), ariaLabel: tHome("startHere.chip.familyFriendly"), variant: "secondary" },
    { href: "/discover", label: tHome("startHere.chip.all"), ariaLabel: tHome("startHere.chip.seeAll"), variant: "secondary" },
  ];

  return (
    <section
      id="start-here"
      aria-labelledby="start-here-explore-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.py} ${SECTION.alt} scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="text-center mb-8 sm:mb-10">
          <p className="text-sm text-olive/80 mb-4">{tHome("startHere.prompt")}</p>
          <p className={`${TYPE.kicker} text-sage mb-2`}>{tHome("startHere.primaryPath")}</p>
          <h2 id="start-here-explore-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            {tHome("startHere.title")}
          </h2>
          <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>
            {tHome("startHere.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {startItems.map((item) => (
            <AppLink
              key={item.title}
              href={item.href}
              prefetch="auto"
              className={`group flex flex-col ${CARD.base} ${CARD.hover} ${CARD.interactive} ${CARD.link} overflow-hidden ${
                item.variant === "primary"
                  ? "border-l-4 border-l-terracotta min-h-[140px] sm:min-h-[160px]"
                  : "border-l-4 border-l-aegean/60"
              }`}
              aria-label={item.title}
            >
              <div className={`flex-1 ${CARD.content}`}>
                <p className={`${TYPE.cardTitle} text-charcoal`}>
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
            </AppLink>
          ))}
        </div>

        <div className="mb-6 sm:mb-8">
          <p className={`${TYPE.kicker} text-sage mb-3 text-center`}>{tHome("startHere.browseByCategory")}</p>
          <div className="relative">
            <div
              className="flex flex-nowrap md:flex-wrap overflow-x-auto scroll-smooth scroll-touch md:overflow-visible justify-start md:justify-center gap-3 pb-2 -mx-1 md:mx-0 px-1 pr-14 md:px-0 md:pr-0 snap-x snap-mandatory overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={tHome("startHere.aria.browseByCategory")}
            >
              {categoryChips.map((c) => (
                <AppLink key={`${c.href}-${c.label}`} href={c.href} prefetch="auto" className={chipClass(c.variant)} aria-label={c.ariaLabel}>
                  {c.label}
                </AppLink>
              ))}
            </div>
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-r from-transparent to-sand/80 md:hidden"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
