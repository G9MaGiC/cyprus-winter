import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { team } from "@/data/team";
import { LAYOUT, CTA, CARD, TYPE } from "@/lib/design-tokens";
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

      <h2 className="sr-only">{tTeam("membersHeading")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map((member) => (
          <article
            key={member.id}
            className={`group ${CARD.base} ${CARD.content} ${CARD.hover} bg-sand-100/90`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta/30 to-terracotta/20 flex items-center justify-center text-2xl font-display font-bold text-olive/80 mb-4">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h3 className={`${TYPE.subSectionTitle} text-olive group-hover:text-terracotta transition-colors truncate`}>
              {member.name}
            </h3>
            <p className="text-terracotta font-medium text-sm mt-0.5 truncate" title={member.role}>
              {member.role}
            </p>
            <p className="text-olive/80 text-sm mt-3 leading-relaxed prose-body break-words">
              {member.bio}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {member.expertise.map((e) => (
                <span
                  key={e}
                  className="text-xs px-2.5 py-1 rounded-md bg-sand-100 text-olive/80 break-words"
                >
                  {e}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className={`mt-16 ${CARD.base} ${CARD.content} bg-sand-100/90 border-l-4 border-l-terracotta/20 text-center`}>
        <p className="text-sm text-olive/80 mb-4">{tTeam("cta.prompt")}</p>
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

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto leading-relaxed break-words">
        {tTeam("outro")}
      </p>
    </div>
  );
}
