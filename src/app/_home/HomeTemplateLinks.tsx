import { Link } from "@/i18n/navigation";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

const TEMPLATE_LINKS = [
  { key: "short-stay", label: "48 hours", href: "/plan?template=short-stay" },
  { key: "classic-7", label: "7 days", href: "/plan?template=classic-7" },
  { key: "mountain-10", label: "10 days", href: "/plan?template=mountain-10" },
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
        <p className="text-sm text-olive/70 mb-3">
          Start with a ready-made plan. Customise as you go.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {TEMPLATE_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg border border-sand-300 text-olive font-medium hover:border-terracotta/50 hover:text-terracotta hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
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
