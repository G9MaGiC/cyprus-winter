import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import PageHeader from "@/components/PageHeader";
import { LAYOUT, CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { getLocale, getTranslations } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

// AUD-66 (batch 51): the public route explains what a guest can actually do —
// add the PWA to a home screen — instead of the old SiteGround deployment
// manual. The copy only claims what the code makes true: sw.js keeps visited
// pages working offline (bookings/API stay online-only), the manifest ships
// standalone display + shortcuts, and iOS install is manual via Share.

const PLATFORM_KEYS = ["android", "ios", "desktop"] as const;
const BENEFIT_KEYS = ["offline", "icon", "shortcuts"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("install", locale);
}

export default async function InstallPage() {
  const [tNav, t] = await Promise.all([getTranslations("nav"), getTranslations("install.page")]);
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={t("header.title")}
        description={t("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: t("header.title"), href: "/install", isCurrent: true },
        ]}
      />

      <section className={`${CARD.base} ${CARD.content} bg-sand-100/90`}>
        <h2 className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
          {t("benefits.title")}
        </h2>
        <ul className="list-disc ps-5 text-muted-ink text-sm leading-relaxed space-y-2">
          {BENEFIT_KEYS.map((key) => (
            <li key={key}>{t(`benefits.items.${key}`)}</li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        {PLATFORM_KEYS.map((key) => (
          <section key={key} className={`${CARD.base} ${CARD.content} bg-sand-100/90`}>
            <h2 className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
              {t(`platforms.${key}.title`)}
            </h2>
            <p className="text-muted-ink text-sm leading-relaxed prose-body break-words">
              {t(`platforms.${key}.body`)}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-muted-ink text-sm leading-relaxed max-w-xl">{t("notes.body")}</p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <AppLink href="/" className={`px-6 py-3 ${CTA.primaryCompact}`}>
          {t("homeCta")}
        </AppLink>
        <AppLink href="/plan" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
          {t("planCta")}
        </AppLink>
      </div>
    </div>
  );
}
