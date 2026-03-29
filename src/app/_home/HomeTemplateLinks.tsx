import type { ComponentType } from "react";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import type { LinkProps } from "@/app/_home/types";

const TEMPLATE_LINKS = [
  { key: "short-stay", label: "48 hours", href: "/plan?template=short-stay", hint: "Trail, village, wine" },
  { key: "classic", label: "5 days", href: "/plan?template=classic", hint: "Coast to mountains" },
  { key: "classic-7", label: "7 days", href: "/plan?template=classic-7", hint: "Full island sweep" },
  { key: "mountain-10", label: "10 days", href: "/plan?template=mountain-10", hint: "Hiker immersion" },
] as const;

export default function HomeTemplateLinks({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const Link = LinkComponent;
  return (
    <section
      aria-labelledby="templates-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} bg-sand/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="mb-6 sm:mb-8">
          <p id="templates-heading" className={`${TYPE.kicker} text-sage mb-3`}>
            Pre-built itineraries
          </p>
          <p className="text-base text-olive/70">
            Expert-curated. Realistic pacing. Start here, then tweak.
          </p>
        </header>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {TEMPLATE_LINKS.map(({ label, href, hint }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex flex-col sm:flex-row sm:items-center sm:gap-2.5 min-h-[52px] px-5 py-3.5 rounded-2xl border border-sand-200/80 text-olive font-medium hover:border-terracotta/40 hover:text-terracotta hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>{label}</span>
              {hint && <span className="text-sm text-olive/60 font-normal">{hint}</span>}
            </Link>
          ))}
          <Link
            href="/plan"
            className="inline-flex items-center min-h-[52px] px-5 py-3 rounded-xl text-olive/70 text-sm font-medium hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
          >
            All templates →
          </Link>
        </div>
      </div>
    </section>
  );
}
