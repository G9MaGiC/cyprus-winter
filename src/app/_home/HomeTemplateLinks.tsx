import type { ComponentType } from "react";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import type { LinkProps } from "@/app/_home/types";
import { getTranslations } from "next-intl/server";

const TEMPLATE_LINKS = [
  { key: "short-stay", label: "48 hours", href: "/plan?template=short-stay", hint: "Trail, village, wine" },
  { key: "classic", label: "5 days", href: "/plan?template=classic", hint: "Coast to mountains" },
  { key: "classic-7", label: "7 days", href: "/plan?template=classic-7", hint: "Full island sweep" },
  { key: "mountain-10", label: "10 days", href: "/plan?template=mountain-10", hint: "Hiker immersion" },
] as const;

export default async function HomeTemplateLinks({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const tHome = await getTranslations("home");
  const Link = LinkComponent;
  return (
    <section
      aria-labelledby="templates-heading"
      className={`${LAYOUT.safeAreaX} ${SECTION.pySub} bg-sand/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="mb-4 sm:mb-5">
          <p id="templates-heading" className={`${TYPE.kicker} text-sage mb-2`}>
            {tHome("templateLinks.kicker")}
          </p>
          <p className="text-sm text-olive/70">
            {tHome("templateLinks.subtitle")}
          </p>
        </header>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {TEMPLATE_LINKS.map(({ label, href, hint }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex flex-col sm:flex-row sm:items-center sm:gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-sand-200/80 text-olive font-medium hover:border-terracotta/40 hover:text-terracotta hover:bg-terracotta/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span>{label}</span>
              {hint && <span className="text-xs text-olive/60 font-normal">{hint}</span>}
            </Link>
          ))}
          <Link
            href="/plan"
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-olive/70 text-sm font-medium hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
          >
            {tHome("templateLinks.allTemplates")}
          </Link>
        </div>
      </div>
    </section>
  );
}
