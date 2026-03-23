import type { ComponentType } from "react";
import { winterTipsGeneral, winterTipsHiking, winterTipsPractical } from "@/data/winter-tips";
import type { LinkProps } from "@/app/_home/types";
import { CALLOUT, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { getTranslations } from "next-intl/server";

const allTips = [...winterTipsGeneral, ...winterTipsHiking, ...winterTipsPractical];

export default async function HomeInsiderTip({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const tHome = await getTranslations("home");
  const Link = LinkComponent;
  const tip = pickDailyWithKey(allTips, "insider-tip");

  function getCtaForCategory(category: string): { href: string; label: string } {
    if (category === "hiking") return { href: "/trails", label: tHome("insiderTip.cta.trails") };
    if (category === "practical") return { href: "/airport", label: tHome("insiderTip.cta.airport") };
    return { href: "/discover", label: tHome("insiderTip.cta.explore") };
  }

  const cta = getCtaForCategory(tip.category);

  return (
    <section
      aria-labelledby="insider-tip-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX} bg-sand/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className={`${CALLOUT.tip} rounded-2xl px-5 sm:px-6 py-5 sm:py-6`}>
          <h2
            id="insider-tip-heading"
            className="font-display text-sm font-semibold uppercase tracking-wider text-golden mb-2"
          >
            {tHome("insiderTip.heading")}
          </h2>
          <h3 className={`${TYPE.cardTitle} text-charcoal ${SECTION.titleGap}`}>
            {tip.title}
          </h3>
          <p className={`text-olive/90 text-sm leading-relaxed ${SECTION.headingGap}`}>
            {tip.body}
          </p>
          <Link
            href={cta.href}
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-golden hover:bg-golden/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2"
          >
            {cta.label} →
          </Link>
        </div>
      </div>
    </section>
  );
}
