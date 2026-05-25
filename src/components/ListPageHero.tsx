import AppLink from "@/components/AppLink";
import Image from "next/image";
import { CARD, HERO, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslations } from "next-intl";

export type BreadcrumbItem = { label: string; href: string; isCurrent?: boolean };

type ListPageHeroProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description: string;
  descriptionSecondary?: string;
  breadcrumbItems?: BreadcrumbItem[];
  backgroundImage?: string;
  backgroundImageAlt?: string;
  hasWidgetStrip?: boolean;
  children?: React.ReactNode;
};

export default function ListPageHero({
  backHref = "/",
  backLabel,
  title,
  description,
  descriptionSecondary,
  breadcrumbItems,
  backgroundImage,
  backgroundImageAlt,
  hasWidgetStrip = false,
  children,
}: ListPageHeroProps) {
  const tCommon = useTranslations("common");
  const resolvedBackLabel = backLabel ?? tCommon("back");
  const textMb = hasWidgetStrip ? "mb-6 sm:mb-8" : SECTION.headingMarginLarge;
  const navBlock = (
    <>
      <AppLink
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-white/90 hover:text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded w-fit"
      >
        ← {resolvedBackLabel}
      </AppLink>
      {breadcrumbItems && breadcrumbItems.length > 1 && (
        <Breadcrumbs items={breadcrumbItems} className="py-1 px-0 text-xs text-white/80" />
      )}
    </>
  );
  const navBlockLight = (
    <>
      <AppLink
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-terracotta/90 hover:text-terracotta text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
      >
        ← {resolvedBackLabel}
      </AppLink>
      {breadcrumbItems && breadcrumbItems.length > 1 && (
        <Breadcrumbs items={breadcrumbItems} className="py-1 px-0 text-xs text-olive/60" />
      )}
    </>
  );
  const content = (
    <div className={textMb}>
      <nav className="flex flex-col gap-1" aria-label={tCommon("aria.pageNavigation")}>
        {navBlockLight}
      </nav>
      <h1 className={`${TYPE.pageTitle} mt-3 sm:mt-4`}>
        {title}
      </h1>
      <p className="text-olive/80 mt-2 max-w-xl prose-body break-words leading-relaxed">
        {description}
      </p>
      {descriptionSecondary && (
        <p className="text-olive/60 text-sm mt-2 max-w-xl break-words">{descriptionSecondary}</p>
      )}
      {children}
    </div>
  );

  if (backgroundImage) {
    return (
      <section className={`relative ${LAYOUT.heroBleedX} ${textMb} overflow-hidden`}>
        <div className="relative aspect-[3/1] sm:aspect-[16/9] min-h-[260px] sm:min-h-[200px]">
          <Image
            src={backgroundImage}
            alt={backgroundImageAlt ?? ""}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={HERO.listOverlay} aria-hidden />
          <div className={`absolute inset-0 flex flex-col justify-end text-white ${CARD.contentLg} ${LAYOUT.safeAreaX} ${LAYOUT.heroContentTop} pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]`}>
            <nav className="flex flex-col gap-1" aria-label={tCommon("aria.pageNavigation")}>
              {navBlock}
            </nav>
            <h1 className={`${TYPE.pageTitle} mt-1.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]`}>
              {title}
            </h1>
            <p className="text-white/90 mt-1 max-w-xl text-sm sm:text-base break-words leading-relaxed">
              {description}
            </p>
            {descriptionSecondary && (
              <p className="text-white/80 text-sm mt-1 max-w-xl break-words">{descriptionSecondary}</p>
            )}
            {children}
          </div>
        </div>
      </section>
    );
  }

  return content;
}
