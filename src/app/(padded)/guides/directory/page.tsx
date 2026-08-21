import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuidesDirectoryClient from "@/app/(padded)/guides/directory/GuidesDirectoryClient";
import { licensedGuideCount } from "@/lib/guides-directory";
import { LOCALE_TO_GUIDE_LANGUAGE } from "@/lib/guides-directory-types";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guides.directory.meta");
  const alternates = buildStrategyAAlternates("/guides/directory");
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
      type: "website",
    },
  };
}

type PageProps = {
  searchParams?: Promise<{ district?: string; lang?: string }>;
};

export default async function GuidesDirectoryPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : {};
  const locale = await getLocale();
  const [tNav, tCommon, tGuides] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("guides.directory"),
  ]);

  const initialDistrict = typeof resolved.district === "string" ? resolved.district : null;
  const initialLanguage =
    typeof resolved.lang === "string"
      ? resolved.lang
      : LOCALE_TO_GUIDE_LANGUAGE[locale] ?? null;

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tGuides("pageNavAria")}>
        <BackLink href="/book/guide" label={tCommon("backTo", { label: tCommon("breadcrumbs.bookGuide") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tCommon("breadcrumbs.bookGuide"), href: "/book/guide" },
            { label: tGuides("breadcrumb"), href: "/guides/directory", isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <header className={SECTION.headingMargin}>
        <h1 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>{tGuides("title")}</h1>
        <p className="text-olive/70 max-w-2xl">{tGuides("intro", { count: licensedGuideCount() })}</p>
        <p className="text-sm text-olive/60 mt-3 max-w-2xl">
          <AppLink href="/book/guide" className={SECTION.aegeanLink}>
            {tGuides("verifiedPartnersLink")}
          </AppLink>
        </p>
      </header>

      <GuidesDirectoryClient
        initialDistrict={initialDistrict}
        initialLanguage={initialLanguage}
      />
    </div>
  );
}
