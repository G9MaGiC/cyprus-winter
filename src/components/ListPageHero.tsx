import Link from "next/link";
import Image from "next/image";
import { CARD, LAYOUT } from "@/lib/design-tokens";

type ListPageHeroProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description: string;
  descriptionSecondary?: string;
  /** Optional background image for hero treatment */
  backgroundImage?: string;
  backgroundImageAlt?: string;
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
  children,
}: ListPageHeroProps) {
  const content = (
    <div className="mb-10 sm:mb-12">
      <Link
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-terracotta/90 hover:text-terracotta text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
      >
        ← {backLabel}
      </Link>
      <h1 className="font-display text-3xl font-bold text-olive mt-3 sm:mt-4 leading-tight break-words">
        {title}
      </h1>
      <p className="text-olive/70 mt-2 max-w-xl prose-body break-words">{description}</p>
      {descriptionSecondary && (
        <p className="text-olive/60 text-sm mt-2 max-w-xl break-words">{descriptionSecondary}</p>
      )}
      {children}
    </div>
  );

  if (backgroundImage) {
    return (
      <section className={`relative ${LAYOUT.heroBleedX} -mt-4 sm:-mt-6 mb-10 sm:mb-12 overflow-hidden`}>
        <div className="relative aspect-[3/1] min-h-[140px] sm:min-h-[180px]">
          <Image
            src={backgroundImage}
            alt={backgroundImageAlt ?? ""}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"
            aria-hidden
          />
          <div className={`absolute inset-0 flex flex-col justify-end ${CARD.contentLg} text-white`}>
            <Link
              href={backHref}
              className="inline-flex items-center min-h-[44px] py-2 text-white/90 hover:text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded w-fit"
            >
              ← {backLabel}
            </Link>
            <h1 className="font-display text-3xl font-bold mt-2 leading-tight break-words drop-shadow-sm">
              {title}
            </h1>
            <p className="text-white/90 mt-1 max-w-xl text-sm sm:text-base break-words">{description}</p>
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
