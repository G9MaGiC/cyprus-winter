import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import AppLink from "@/components/AppLink";
import { CTA } from "@/lib/design-tokens";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "terms.page" });
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/terms` },
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage() {
  const [tNav, tCommon, tTerms] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("terms.page"),
  ]);
  return (
    <div className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tTerms("header.title")}
        description={tTerms("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tCommon("breadcrumbs.terms"), href: "/terms", isCurrent: true },
        ]}
      />

      <article className={`prose prose-olive max-w-none ${SECTION.blockGap}`}>
        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s1.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms.rich("sections.s1.body", {
              privacyPolicyLink: (chunks) => (
                <AppLink href="/privacy" className="text-terracotta hover:underline">
                  {chunks}
                </AppLink>
              ),
            })}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s2.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms.rich("sections.s2.body", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s3.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed mb-4">
            {tTerms("sections.s3.intro")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>{tTerms("sections.s3.items.licence")}</li>
            <li>{tTerms("sections.s3.items.ownership")}</li>
            <li>{tTerms("sections.s3.items.noHarm")}</li>
          </ul>
          <p className="text-olive/90 leading-relaxed mt-4">
            {tTerms("sections.s3.outro")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s4.title")}
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-olive/90">
            <li>
              {tTerms.rich("sections.s4.items.trail", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tTerms.rich("sections.s4.items.outdoor", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tTerms.rich("sections.s4.items.bookings", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {tTerms.rich("sections.s4.items.ai", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          </ul>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s5.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms("sections.s5.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s6.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms("sections.s6.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s7.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms("sections.s7.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s8.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms("sections.s8.body")}
          </p>
        </section>

        <section>
          <h2 className={`${TYPE.subSectionTitle} text-charcoal ${SECTION.blockTop} ${SECTION.titleGap}`}>
            {tTerms("sections.s9.title")}
          </h2>
          <p className="text-olive/90 leading-relaxed">
            {tTerms.rich("sections.s9.body", {
              email: "legal@cypruswinter.com",
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </section>
      </article>

      <div className="mt-12 flex flex-wrap gap-4">
        <AppLink href="/privacy" className={CTA.secondaryCompact}>
          {tTerms("footer.privacyCta")}
        </AppLink>
        <AppLink href="/" className={CTA.chipTertiary}>
          {tTerms("footer.homeCta")}
        </AppLink>
      </div>
    </div>
  );
}
