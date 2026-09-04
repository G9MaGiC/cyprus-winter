import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { LAYOUT, CTA, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { getLocale, getTranslations } from "next-intl/server";

// §5.2 decision (batch 38): the fabricated team roster is gone. The route now
// carries the honest trust page — how places are chosen and verified — which
// is the claim the product can actually stand behind.

const SECTION_KEYS = ["walked", "sources", "partners", "corrections"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "team.page" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildStrategyAAlternates("/team"),
  };
}

export default async function HowWeChoosePage() {
  const [tNav, tTeam] = await Promise.all([getTranslations("nav"), getTranslations("team.page")]);
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tTeam("header.title")}
        description={tTeam("header.description")}
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("team"), href: "/team", isCurrent: true }]}
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {SECTION_KEYS.map((key) => (
          <section key={key} className={`${CARD.base} ${CARD.content} bg-sand-100/90`}>
            <h2 className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
              {tTeam(`sections.${key}.title`)}
            </h2>
            <p className="text-muted-ink text-sm leading-relaxed prose-body break-words">
              {tTeam(`sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>

      <div className={`mt-16 ${CARD.base} ${CARD.content} bg-sand-100/90 border-s-4 border-s-terracotta/20 text-center`}>
        <p className="text-sm text-muted-ink mb-4">{tTeam("cta.prompt")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AIAssistantTrigger label={tTeam("cta.askAi")} />
          <AppLink href="/plan" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            {tTeam("cta.startPlanning")}
          </AppLink>
          <AppLink href="/discover" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            {tTeam("cta.discoverPlaces")}
          </AppLink>
        </div>
      </div>

      <p className="mt-12 text-center text-muted-ink text-sm max-w-md mx-auto leading-relaxed break-words">
        {tTeam("outro")}
      </p>
    </div>
  );
}
