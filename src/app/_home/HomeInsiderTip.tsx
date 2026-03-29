import type { ComponentType } from "react";
import { winterTipsGeneral, winterTipsHiking, winterTipsPractical } from "@/data/winter-tips";
import type { LinkProps } from "@/app/_home/types";
import { CALLOUT, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { pickDailyWithKey } from "@/lib/daily-rotator";

const allTips = [...winterTipsGeneral, ...winterTipsHiking, ...winterTipsPractical];

function getCtaForCategory(category: string): { href: string; label: string } {
  if (category === "hiking") return { href: "/trails", label: "Check trail conditions" };
  if (category === "practical") return { href: "/airport", label: "See airport tips" };
  return { href: "/discover", label: "Explore places" };
}

export default function HomeInsiderTip({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const Link = LinkComponent;
  const tip = pickDailyWithKey(allTips, "insider-tip");
  const cta = getCtaForCategory(tip.category);

  return (
    <section
      aria-labelledby="insider-tip-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX} bg-sand/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className={`${CALLOUT.tip} rounded-2xl px-6 sm:px-8 py-6 sm:py-8`}>
          <h2
            id="insider-tip-heading"
            className="prose-label text-golden mb-3"
          >
            Winter insider tip
          </h2>
          <h3 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.titleGap}`}>
            {tip.title}
          </h3>
          <p className={`text-olive/80 text-base leading-relaxed ${SECTION.headingGap}`}>
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
