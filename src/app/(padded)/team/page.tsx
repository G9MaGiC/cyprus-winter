import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { LAYOUT, CTA, CARD } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "team.page" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildStrategyAAlternates("/team"),
  };
}

export default async function TeamPage() {
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

      <div className={`${CARD.base} ${CARD.content} bg-sand-100/90 border-s-4 border-s-terracotta/20 text-center`}>
        <p className="text-muted-ink max-w-2xl mx-auto leading-relaxed">
          {tTeam("outro")}
        </p>
      </div>

      <div className={`mt-8 ${CARD.base} ${CARD.content} bg-sand-100/90 border-s-4 border-s-terracotta/20 text-center`}>
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
    </div>
  );
}
