import Image from "next/image";
import { CARD, LAYOUT } from "@/lib/design-tokens";

type DetailHeroProps = {
  image: string;
  imageAlt: string;
  badge?: React.ReactNode;
  title: string;
  titleEl?: string;
  subtitle: string;
  children?: React.ReactNode;
  rounded?: boolean;
};

export default function DetailHero({
  image,
  imageAlt,
  badge,
  title,
  titleEl,
  subtitle,
  children,
  rounded = false,
}: DetailHeroProps) {
  return (
    <header className={`relative ${LAYOUT.heroBleedX} mt-6 mb-10 sm:mb-12`}>
      <div
        className={`relative aspect-[4/3] sm:aspect-video overflow-hidden bg-olive/10 ${
          rounded ? "rounded-lg sm:rounded-xl" : ""
        }`}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden
        />
        <div className={`absolute bottom-0 left-0 right-0 ${CARD.contentLg} text-white`}>
          {badge && <div className="mb-3">{badge}</div>}
          <h1 className="font-display text-3xl sm:text-4xl font-bold break-words drop-shadow-sm">
            {title}
            {titleEl && (
              <span className="ml-2 font-normal text-2xl sm:text-3xl text-white/90 break-words" lang="el">
                {titleEl}
              </span>
            )}
          </h1>
          <p className="text-white/90 font-medium mt-1 break-words">{subtitle}</p>
          {children}
        </div>
      </div>
    </header>
  );
}
