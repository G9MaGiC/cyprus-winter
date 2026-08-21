import AppLink from "@/components/AppLink";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { LAYOUT, CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("install", locale);
}

type InstallStep = { title: string; body: string; code?: string; note?: string };

const stepCode = {
  s1: `const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // ... existing config
};`,
  s2: `npm install
npm run build`,
  s3: "Upload: out/*  →  public_html/",
  s4: `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`,
};

export default async function InstallPage() {
  const [tNav, tCommon, tInstall] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("install.page"),
  ]);
  const steps: InstallStep[] = [
    {
      title: tInstall("steps.items.s1.title"),
      body: tInstall("steps.items.s1.body"),
      code: stepCode.s1,
      note: tInstall("steps.items.s1.note"),
    },
    {
      title: tInstall("steps.items.s2.title"),
      body: tInstall("steps.items.s2.body"),
      code: stepCode.s2,
      note: tInstall("steps.items.s2.note"),
    },
    {
      title: tInstall("steps.items.s3.title"),
      body: tInstall("steps.items.s3.body"),
      code: stepCode.s3,
      note: tInstall("steps.items.s3.note"),
    },
    {
      title: tInstall("steps.items.s4.title"),
      body: tInstall("steps.items.s4.body"),
      code: stepCode.s4,
      note: tInstall("steps.items.s4.note"),
    },
    {
      title: tInstall("steps.items.s5.title"),
      body: tInstall("steps.items.s5.body"),
    },
  ];
  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-8" aria-label={tInstall("nav.ariaLabel")}>
        <BackLink href="/" label={tCommon("backTo", { label: tInstall("nav.backLabel") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tInstall("nav.breadcrumbCurrent"), href: "/install", isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <header className={SECTION.headingMarginLarge}>
        <p className="text-golden text-sm font-medium tracking-[0.15em] uppercase mb-2">
          {tInstall("header.kicker")}
        </p>
        <h1 className={`${TYPE.pageTitle} text-charcoal mt-2`}>
          {tInstall("header.title")}
        </h1>
        <p className="mt-3 text-olive/80 text-base leading-relaxed max-w-xl">
          {tInstall("header.body")}
        </p>
      </header>

      <section aria-labelledby="requirements" className="mb-12">
        <h2 id="requirements" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
          {tInstall("requirements.title")}
        </h2>
        <ul className={`${CARD.base} ${CARD.content} space-y-2 text-olive/90`}>
          <li>{`• ${tInstall("requirements.items.node")}`}</li>
          <li>{`• ${tInstall("requirements.items.siteground")}`}</li>
          <li>{`• ${tInstall("requirements.items.domain")}`}</li>
        </ul>
      </section>

      <section aria-labelledby="steps" className="space-y-10 mt-16 sm:mt-20">
        <h2 id="steps" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
          {tInstall("steps.title")}
        </h2>

        {steps.map((step, i) => (
          <article
            key={i}
            className={`${CARD.base} ${CARD.hover} ${CARD.contentLg}`}
            aria-labelledby={`step-${i}`}
          >
            <h3 id={`step-${i}`} className={`${TYPE.cardTitle} text-charcoal ${SECTION.titleGap}`}>
              {step.title}
            </h3>
            <p className={`text-olive/90 text-sm sm:text-base leading-relaxed ${SECTION.headingGap}`}>
              {step.body}
            </p>
            {step.code && (
              <pre
                className="rounded-lg bg-charcoal text-white p-4 overflow-x-auto text-sm font-mono mb-4"
                role="region"
                aria-label={tInstall("steps.codeSnippetAria")}
              >
                <code>{step.code}</code>
              </pre>
            )}
            {step.note && (
              <p className="text-olive/70 text-sm leading-relaxed italic">
                {step.note}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="troubleshooting" className={SECTION.footerBlock}>
        <h2 id="troubleshooting" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
          {tInstall("troubleshooting.title")}
        </h2>
        <ul className="space-y-3 text-olive/90 text-sm">
          <li>
            <strong className="text-charcoal">{tInstall("troubleshooting.items.blank.label")}</strong>{" "}
            {tInstall("troubleshooting.items.blank.body")}
          </li>
          <li>
            <strong className="text-charcoal">{tInstall("troubleshooting.items.images.label")}</strong>{" "}
            {tInstall.rich("troubleshooting.items.images.body", {
              config: (chunks) => (
                <code className="rounded bg-sand-200 px-1 py-0.5">{chunks}</code>
              ),
            })}
          </li>
          <li>
            <strong className="text-charcoal">{tInstall("troubleshooting.items.api.label")}</strong>{" "}
            {tInstall("troubleshooting.items.api.body")}
          </li>
        </ul>
      </section>

      <div className="mt-16 sm:mt-20 flex flex-wrap gap-4">
        <AppLink href="/" className={`px-8 py-3 rounded-xl ${CTA.primaryCompact}`}>
          {tCommon("backTo", { label: tInstall("footer.backToAppLabel") })}
        </AppLink>
      </div>
    </div>
  );
}
