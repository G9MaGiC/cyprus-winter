import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { LAYOUT, CTA, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { getLocale, getTranslations } from "next-intl/server";

// AUD-81-residual (batch 48): the honest onboarding surface. It mirrors the
// /team trust claims (free listings, verified-never-paid) and the
// partner-verification.ts contract (badge only with a reachable booking
// contact), and deliberately publishes no contact address while the ops
// mailbox (AUD-67) does not exist — no channel that goes nowhere.

const SECTION_KEYS = ["what", "who", "verify", "now"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "partner.join" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: buildStrategyAAlternates("/partner/join"),
  };
}

export default async function PartnerJoinPage() {
  const [tNav, t] = await Promise.all([getTranslations("nav"), getTranslations("partner.join")]);
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/team"
        backLabel={tNav("team")}
        title={t("header.title")}
        description={t("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("team"), href: "/team" },
          { label: t("header.title"), href: "/partner/join", isCurrent: true },
        ]}
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {SECTION_KEYS.map((key) => (
          <section key={key} className={`${CARD.base} ${CARD.content} bg-sand-100/90`}>
            <h2 className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
              {t(`sections.${key}.title`)}
            </h2>
            <p className="text-muted-ink text-sm leading-relaxed prose-body break-words">
              {t(`sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/partner" className={`px-6 py-3 ${CTA.primaryCompact}`}>
          {t("portalCta")}
        </AppLink>
        <AppLink href="/guides/directory" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
          {t("directoryCta")}
        </AppLink>
      </div>
    </div>
  );
}
