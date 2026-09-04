import type { Metadata } from "next";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import AppLink from "@/components/AppLink";
import { CTA } from "@/lib/design-tokens";
import { getLocale, getTranslations } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("privacy", locale);
}

export default async function PrivacyPage() {
  const [tNav, tCommon, tPrivacy] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("privacy.page"),
  ]);
  return (
    <div className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tPrivacy("header.title")}
        description={tPrivacy("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tCommon("breadcrumbs.privacy"), href: "/privacy", isCurrent: true },
        ]}
      />

      <article className={`prose prose-olive max-w-none ${SECTION.blockGap}`}>
        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s1.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tPrivacy("sections.s1.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s2.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            {tPrivacy("sections.s2.intro")}
          </p>
          <ul className="list-disc ps-6 space-y-2 text-olive/90">
            <li>
              {tPrivacy.rich("sections.s2.items.conversion", {
                strong: (chunks) => <strong>{chunks}</strong>,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s2.items.booking", {
                strong: (chunks) => <strong>{chunks}</strong>,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s2.items.trailReports", {
                strong: (chunks) => <strong>{chunks}</strong>,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s2.items.chat", {
                strong: (chunks) => <strong>{chunks}</strong>,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s2.items.localPrefs", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          </ul>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s3.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            {tPrivacy("sections.s3.intro")}
          </p>
          <ul className="list-disc ps-6 space-y-2 text-olive/90">
            <li>
              {tPrivacy.rich("sections.s3.processors.supabase", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s3.processors.resend", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s3.processors.ai", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tPrivacy.rich("sections.s3.processors.vercel", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            {tPrivacy("sections.s3.transfers")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s4.title")}
          </h2>
          <ul className="list-disc ps-6 space-y-2 text-olive/90">
            <li>
              {tPrivacy.rich("sections.s4.items.conversion", { strong: (chunks) => <strong>{chunks}</strong> })}
            </li>
            <li>{tPrivacy.rich("sections.s4.items.bookings", { strong: (chunks) => <strong>{chunks}</strong> })}</li>
            <li>
              {tPrivacy.rich("sections.s4.items.trailReports", { strong: (chunks) => <strong>{chunks}</strong> })}
            </li>
            <li>{tPrivacy.rich("sections.s4.items.chat", { strong: (chunks) => <strong>{chunks}</strong> })}</li>
          </ul>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s5.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            {tPrivacy("sections.s5.intro")}
          </p>
          <ul className="list-disc ps-6 space-y-2 text-olive/90">
            <li>{tPrivacy("sections.s5.rights.access")}</li>
            <li>{tPrivacy("sections.s5.rights.rectify")}</li>
            <li>{tPrivacy("sections.s5.rights.erase")}</li>
            <li>{tPrivacy("sections.s5.rights.restrict")}</li>
            <li>{tPrivacy("sections.s5.rights.portability")}</li>
            <li>{tPrivacy("sections.s5.rights.object")}</li>
            <li>{tPrivacy("sections.s5.rights.withdraw")}</li>
            <li>{tPrivacy("sections.s5.rights.complaint")}</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            {tPrivacy("sections.s5.outro")}
          </p>
        </section>

        <section id="cookies" className="scroll-mt-24">
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s6.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            {tPrivacy("sections.s6.intro")}
          </p>
          <ul className="list-disc ps-6 space-y-2 text-olive/90">
            <li>{tPrivacy.rich("sections.s6.categories.essential", { strong: (chunks) => <strong>{chunks}</strong> })}</li>
            <li>{tPrivacy.rich("sections.s6.categories.analytics", { strong: (chunks) => <strong>{chunks}</strong> })}</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            {tPrivacy("sections.s6.outro")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s7.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tPrivacy("sections.s7.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s8.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tPrivacy("sections.s8.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tPrivacy("sections.s9.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tPrivacy.rich("sections.s9.body", {
              email: "privacy@cypruswinter.com",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>
      </article>

      <div className="mt-12 flex flex-wrap gap-4">
        <AppLink href="/terms" className={CTA.secondaryCompact}>
          {tPrivacy("footer.termsCta")}
        </AppLink>
        <AppLink href="/" className={CTA.chipTertiary}>
          {tPrivacy("footer.homeCta")}
        </AppLink>
      </div>
    </div>
  );
}
