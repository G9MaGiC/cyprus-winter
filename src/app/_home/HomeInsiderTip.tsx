import "server-only";

import AppLink from "@/components/AppLink";
import { getHomeInsiderTip } from "@/app/_home/home-insider-tip-data";
import { CALLOUT, CARD, SECTION, TYPE } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

type Props = { locale?: string };

function ctaKey(category: string): "hiking" | "practical" | "default" {
  if (category === "hiking") return "hiking";
  if (category === "practical") return "practical";
  return "default";
}

function ctaHref(category: string): string {
  if (category === "hiking") return "/trails";
  if (category === "practical") return "/airport";
  return "/discover";
}

export default async function HomeInsiderTip({ locale }: Props) {
  const [t, tip] = await Promise.all([
    locale ? getTranslations({ locale, namespace: "home" }) : await getTranslations("home"),
    getHomeInsiderTip(locale),
  ]);
  const key = ctaKey(tip.category);

  return (
    <section aria-labelledby="insider-tip-heading">
      <div className={`${CALLOUT.tip} ${CARD.content}`}>
        <h2
          id="insider-tip-heading"
          className="font-display text-sm font-semibold uppercase tracking-wider text-golden mb-2"
        >
          {t("insiderTip.heading")}
        </h2>
        <h3 className={`${TYPE.cardTitle} text-charcoal ${SECTION.titleGap}`}>{tip.title}</h3>
        <p className={`text-olive/90 text-sm leading-relaxed ${SECTION.headingGap}`}>{tip.body}</p>
        <AppLink
          href={ctaHref(tip.category)}
          className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-golden hover:bg-golden/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2"
        >
          {t(`insiderTip.cta.${key}`)} →
        </AppLink>
      </div>
    </section>
  );
}
