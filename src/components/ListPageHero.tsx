import Link from "next/link";
import Image from "next/image";
import { CARD, HERO, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

type ListPageHeroProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description: string;
  descriptionSecondary?: string;
  /** Optional background image for hero treatment */
  backgroundImage?: string;
  backgroundImageAlt?: string;
  /** When true, slightly tighter bottom margin for use with widget strip below */
  hasWidgetStrip?: boolean;
  children?: React.ReactNode;
};

export default function ListPageHero({
  backHref = "/",
  backLabel = "Back",
  title,
  description,
  descriptionSecondary,
  backgroundImage,
  backgroundImageAlt,
  hasWidgetStrip = false,
  children,
}: ListPageHeroProps) {
  const textMb = hasWidgetStrip ? "mb-8 sm:mb-10" : SECTION.headingMarginLarge;
  const content = (
    <div className={textMb}>
      <Link
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-terracotta/90 hover:text-terracotta text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
      >
        ← {backLabel}
      </Link>
      <h1 className={`${TYPE.pageTitle} mt-3 sm:mt-4`}>
        {title}
      </h1>
      <p className="text-olive/70 mt-2 max-w-xl prose-body break-words leading-relaxed">
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
      <section className={`relative ${LAYOUT.heroBleedX} -mt-4 sm:-mt-6 ${textMb} overflow-hidden`}>
        <div className="relative aspect-[3/1] sm:aspect-[16/9] min-h-[200px] sm:min-h-[240px]">
          <Image
            src={backgroundImage}
            alt={backgroundImageAlt ?? "Page hero image"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={HERO.listOverlay} aria-hidden />
          <div className={`absolute inset-0 flex flex-col justify-end ${CARD.contentLg} text-white`}>
            <Link
              href={backHref}
              className="inline-flex items-center min-h-[44px] py-2 text-white/90 hover:text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded w-fit"
            >
              ← {backLabel}
            </Link>
            <h1 className={`${TYPE.pageTitle} mt-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]`}>
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
