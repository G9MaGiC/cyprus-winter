import { Link } from "@/i18n/navigation";
import { CARD, CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

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
  { href: "/trails", label: "Trails", ariaLabel: "Trails", variant: "secondary" },
  { href: "/events", label: "Events", ariaLabel: "Events", variant: "secondary" },
  { href: "/discover?filter=family", label: "Family-friendly", ariaLabel: "Family-friendly", variant: "secondary" },
  { href: "/trails", label: "Trail conditions", ariaLabel: "Trail conditions", variant: "secondary" },
  { href: "/discover", label: "All", ariaLabel: "See all", variant: "secondary" },
];

const alsoChips: Chip[] = [
  { href: "/discover?filter=ancient", label: "Culture", ariaLabel: "Culture", variant: "tertiary" },
  { href: "/discover?filter=beach", label: "Coasts", ariaLabel: "Coasts", variant: "tertiary" },
  { href: "/discover?filter=monastery", label: "Monasteries", ariaLabel: "Monasteries", variant: "tertiary" },
];

const moodChips: Chip[] = [
  { href: "/trails", label: "Active", ariaLabel: "Active adventures — trails, hiking", variant: "secondary" },
  { href: "/discover?filter=ancient", label: "Culture", ariaLabel: "Culture — ancient sites, ruins", variant: "secondary" },
  { href: "/discover?filter=winery", label: "Wine", ariaLabel: "Wine — wineries, tastings", variant: "secondary" },
  { href: "/discover?filter=quiet", label: "Quiet escapes", ariaLabel: "Quiet escapes — villages, hidden gems", variant: "secondary" },
  { href: "/trails", label: "Mountains", ariaLabel: "Mountains — Troodos trails", variant: "secondary" },
  { href: "/discover?filter=village", label: "Villages", ariaLabel: "Villages — cobbled streets, kafenions", variant: "secondary" },
  { href: "/discover?filter=monastery", label: "Wellness", ariaLabel: "Wellness — monasteries, quiet spaces", variant: "secondary" },
];

function chipClass(v: Chip["variant"]) {
  if (v === "primary") return CTA.chipPrimary;
  if (v === "secondary") return CTA.chipSecondary;
  return CTA.chipTertiary;
}

export default function StartHereWithExplore() {
  return (
    <section
      aria-labelledby="start-here-explore-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.py} ${SECTION.alt}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="text-center mb-8 sm:mb-10">
          <p className={`${TYPE.kicker} text-sage mb-2`}>Primary path</p>
          <h2 id="start-here-explore-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            Start here
          </h2>
          <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>
            Ruins to village tastings. Start anywhere.
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

        <div className="pt-4 sm:pt-6 border-t border-sand-200/80 mb-6 sm:mb-8">
          <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Plan by region</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { slug: "larnaca", label: "Larnaca" },
              { slug: "paphos", label: "Paphos" },
              { slug: "limassol", label: "Limassol" },
            ].map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/regions/${slug}`}
                prefetch="auto"
                className={CTA.chipTertiary}
                aria-label={`${label} region — places and trips`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-4 sm:pt-6 border-t border-sand-200/80 mb-8 sm:mb-10">
          <p className={`${TYPE.kicker} text-sage text-center mb-3`}>Culture, coasts, monasteries</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {alsoChips.map((c) => (
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
                className={`${CTA.chipSecondary} rounded-xl`}
                aria-label={m.ariaLabel}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
