import { Link } from "@/i18n/navigation";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

const TEMPLATE_LINKS = [
  { key: "short-stay", label: "48 hours", href: "/plan?template=short-stay", hint: "Trail, village, wine" },
  { key: "classic", label: "5 days", href: "/plan?template=classic", hint: "Coast to mountains" },
  { key: "classic-7", label: "7 days", href: "/plan?template=classic-7", hint: "Full island sweep" },
  { key: "mountain-10", label: "10 days", href: "/plan?template=mountain-10", hint: "Hiker immersion" },
] as const;

export default function HomeTemplateLinks() {
  return (
    <section
      aria-labelledby="templates-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} pt-0`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <p id="templates-heading" className={`${TYPE.kicker} mb-2`}>
          Pre-built itineraries
        </p>
        <p className={`text-sm text-olive/70 ${SECTION.headingGap}`}>
          Curated by local experts—realistic pacing, winery tips, seasonal advice. Start here, then tweak.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {TEMPLATE_LINKS.map(({ label, href, hint }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex flex-col sm:flex-row sm:items-center sm:gap-2 min-h-[44px] px-4 py-2.5 rounded-lg border border-sand-300 text-olive font-medium hover:border-terracotta/50 hover:text-terracotta hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>{label}</span>
              {hint && <span className="text-xs text-olive/60 font-normal">{hint}</span>}
            </Link>
          ))}
          <Link
            href="/plan"
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-olive/70 text-sm font-medium hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
          >
            All templates →
          </Link>
        </div>
      </div>
    </section>
  );
}
