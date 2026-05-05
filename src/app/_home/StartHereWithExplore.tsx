"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import AppLink from "@/components/AppLink";
import { CARD, CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

/** Client-only section — must import Link here; RSC cannot pass component refs into client components. */
const Link = AppLink;

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

const startItems: StartHereItem[] = [
  {
    title: "Discover",
    desc: "Places that feel real. Ruins, coasts, villages, heritage.",
    href: "/discover",
    cta: "Start exploring",
    variant: "primary",
  },
  {
    title: "Plan",
    desc: "Build a day or pick a template. Saves as you go.",
    href: "/plan",
    cta: "Build a day",
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

const categoryChips: Chip[] = [
  { href: "/discover?filter=village", label: "Villages", ariaLabel: "Villages", variant: "primary" },
  { href: "/discover?filter=winery", label: "Wineries", ariaLabel: "Wineries", variant: "primary" },
  { href: "/trails", label: "Trails", ariaLabel: "Trails and conditions", variant: "secondary" },
  { href: "/events", label: "Events", ariaLabel: "Events", variant: "secondary" },
  { href: "/discover?filter=family", label: "Family-friendly", ariaLabel: "Family-friendly", variant: "secondary" },
  { href: "/discover", label: "All", ariaLabel: "See all", variant: "secondary" },
];

/** Region + culture/coasts/monasteries merged into one "Explore more" group. */
const exploreMoreChips: Chip[] = [
  { href: "/regions/larnaca", label: "Larnaca", ariaLabel: "Larnaca region", variant: "tertiary" },
  { href: "/regions/paphos", label: "Paphos", ariaLabel: "Paphos region", variant: "tertiary" },
  { href: "/regions/limassol", label: "Limassol", ariaLabel: "Limassol region", variant: "tertiary" },
  { href: "/regions/troodos", label: "Troodos", ariaLabel: "Troodos region", variant: "tertiary" },
  { href: "/regions/ayia-napa", label: "Ayia Napa", ariaLabel: "Ayia Napa region", variant: "tertiary" },
  { href: "/discover?filter=ancient", label: "Culture", ariaLabel: "Culture", variant: "tertiary" },
  { href: "/discover?filter=beach", label: "Coasts", ariaLabel: "Coasts", variant: "tertiary" },
  { href: "/discover?filter=monastery", label: "Monasteries", ariaLabel: "Monasteries", variant: "tertiary" },
];

const moodChips: Chip[] = [
  { href: "/trails", label: "Active", ariaLabel: "Active adventures — trails, hiking", variant: "secondary" },
  { href: "/discover?filter=quiet", label: "Quiet escapes", ariaLabel: "Quiet escapes — villages, hidden gems", variant: "secondary" },
  { href: "/regions/troodos", label: "Mountains", ariaLabel: "Mountains — Troodos region and high trails", variant: "secondary" },
  { href: "/discover?filter=monastery", label: "Wellness", ariaLabel: "Wellness — monasteries, quiet spaces", variant: "secondary" },
];

function chipClass(v: Chip["variant"]) {
  if (v === "primary") return CTA.chipPrimary;
  if (v === "secondary") return CTA.chipSecondary;
  return CTA.chipTertiary;
}

export default function StartHereWithExplore() {
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Until mounted, treat as desktop layout to match SSR and avoid collapsed flash on large screens. */
  const showDesktopChipGroups = wide !== false;

  return (
    <section
      id="start-here"
      aria-labelledby="start-here-explore-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.py} ${SECTION.alt} scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="text-center mb-8 sm:mb-10">
          <p className="text-sm text-olive/80 mb-4">So — where do you want to go first?</p>
          <p className={`${TYPE.kicker} text-sage mb-2`}>Primary path</p>
          <h2 id="start-here-explore-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            Start here
          </h2>
          <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>
            Just landed or still planning? Ruins to village tastings — start anywhere.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {startItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              prefetch="auto"
              className={`group flex flex-col ${CARD.base} ${CARD.hover} ${CARD.interactive} ${CARD.link} overflow-hidden ${
                item.variant === "primary"
                  ? "border-l-4 border-l-terracotta min-h-[140px] sm:min-h-[160px]"
                  : "border-l-4 border-l-aegean/60"
              }`}
              aria-label={`${item.title}: ${item.desc}`}
            >
              <div className={`flex-1 ${CARD.content}`}>
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

        <div className="relative mb-6 sm:mb-8">
          <p className={`${TYPE.kicker} text-sage mb-3 text-center`}>Browse by category</p>
          <div
            className="flex flex-nowrap sm:flex-wrap overflow-x-auto scroll-smooth scroll-touch sm:overflow-visible justify-start sm:justify-center gap-3 pb-2 -mx-1 sm:mx-0 px-1 sm:px-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="navigation"
            aria-label="Browse by category"
          >
            {categoryChips.map((c) => (
              <Link key={`${c.href}-${c.label}`} href={c.href} prefetch="auto" className={chipClass(c.variant)} aria-label={c.ariaLabel}>
                {c.label}
              </Link>
            ))}
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-r from-transparent to-sand/80 sm:hidden"
            aria-hidden
          />
        </div>

        {showDesktopChipGroups ? (
          <>
            <div className="pt-4 sm:pt-6 border-t border-sand-200/80 mb-8 sm:mb-10">
              <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Explore more</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {exploreMoreChips.map((c) => (
                  <Link key={`${c.href}-${c.label}`} href={c.href} prefetch="auto" className={chipClass(c.variant)} aria-label={c.ariaLabel}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Explore by mood</p>
              <div
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                role="navigation"
                aria-label="Explore by how you feel"
              >
                {moodChips.map((m) => (
                  <Link
                    key={m.href + m.label}
                    href={m.href}
                    prefetch="auto"
                    className={CTA.chipSecondary}
                    aria-label={m.ariaLabel}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <details className="group rounded-2xl border border-sand-200/80 bg-white/60 shadow-sm open:bg-white/80 open:shadow-md transition-shadow">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 text-left select-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand min-h-[48px]">
              <div className="min-w-0">
                <p className="font-medium text-olive">More regions, topics & moods</p>
                <p className="text-xs text-olive/60 mt-0.5">Optional—same shortcuts as on larger screens</p>
              </div>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-olive/45 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="border-t border-sand-200/80 px-3 pb-5 pt-4 sm:px-4 space-y-8">
              <div>
                <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Explore more</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {exploreMoreChips.map((c) => (
                    <Link key={`${c.href}-${c.label}`} href={c.href} prefetch="auto" className={chipClass(c.variant)} aria-label={c.ariaLabel}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Explore by mood</p>
                <div
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                  role="navigation"
                  aria-label="Explore by how you feel"
                >
                  {moodChips.map((m) => (
                    <Link
                      key={m.href + m.label}
                      href={m.href}
                      prefetch="auto"
                      className={CTA.chipSecondary}
                      aria-label={m.ariaLabel}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
