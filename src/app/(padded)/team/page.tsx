import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { teamPageMeta } from "@/lib/locale-page-meta";
import { team } from "@/data/team";
import { LAYOUT, CTA, CARD } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";

export const metadata: Metadata = applyLocaleToMetadata(teamPageMeta, "/team", routing.defaultLocale);

export default function TeamPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Our Team"
        description="Designers, developers, and tourism experts. Cyprus in winter deserves more than a one-line mention."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Team", href: "/team", isCurrent: true }]}
      />

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
            <h3 className="font-display text-xl font-semibold text-olive group-hover:text-terracotta transition-colors truncate">
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
        <p className="text-sm text-olive/80 mb-4">Meet the team behind your trip — and ask them anything.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AIAssistantTrigger label="Ask AI" />
          <Link href="/plan" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            Start planning
          </Link>
          <Link href="/discover" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            Discover places
          </Link>
        </div>
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto leading-relaxed break-words">
        Trail in the morning: Artemis or Caledonia. Omodos or Lefkara for lunch. A winery in the afternoon. That&apos;s a day we&apos;d take. The island rewards the curious.
      </p>
    </div>
  );
}
