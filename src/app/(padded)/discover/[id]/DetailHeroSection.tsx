import DetailHero from "@/components/DetailHero";
import { CARD, CALLOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { getAttractionImage } from "@/lib/cyprus-images";
import { getLocalizedName } from "@/lib/localize";
import Image from "next/image";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";

type DetailHeroSectionProps = {
  a: Attraction | Restaurant;
  locale: string;
  typeLabel: string;
  tDetail: (key: string, values?: Record<string, string>) => string;
  /** Localized, pre-joined bestFor pair for the whyNow sentence (AUD-99). */
  bestForTypes: string;
  /** Decided on the EN base record — culturalNote is a localized field, so
      matching the literal phrase against the overlaid value would miss on
      every non-EN locale. */
  bufferZoneNote: boolean;
};

export default function DetailHeroSection({
  a,
  locale,
  typeLabel,
  tDetail,
  bestForTypes,
  bufferZoneNote,
}: DetailHeroSectionProps) {
  const seasonTags = "seasonTags" in a ? (a.seasonTags as string[] | undefined) : undefined;
  const indoorOutdoor = "indoorOutdoor" in a ? (a.indoorOutdoor as string | undefined) : undefined;
  const budgetLevel = "budgetLevel" in a ? (a.budgetLevel as string | undefined) : undefined;
  const winterOpen = "winterOpen" in a ? (a.winterOpen as boolean | undefined) : undefined;
  const galleryImages = "galleryImages" in a ? (a.galleryImages as string[] | undefined) : undefined;

  return (
    <>
      <DetailHero
        image={getAttractionImage(a.id, a.type)}
        imageAlt={tDetail("imageAlt", { name: a.name, region: a.region, type: typeLabel })}
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-white/25 backdrop-blur-md tracking-wide">
              {typeLabel}
            </span>
            {winterOpen === true && (
              <span className="inline-block px-3 py-1 rounded-md text-xs font-medium bg-white/25 backdrop-blur-md tracking-wide">
                {tDetail("winter.open")}
              </span>
            )}
          </div>
        }
        title={getLocalizedName(a, locale)}
        titleEl={"nameEl" in a && a.nameEl && locale === "en" ? a.nameEl : undefined}
        subtitle={a.region}
      />

      <div className="space-y-10 sm:space-y-14">
        {(seasonTags?.length || indoorOutdoor || budgetLevel) && (
          <section className="flex flex-wrap gap-2">
            {seasonTags?.length ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sand-200/70 text-muted-ink">
                {tDetail("winter.seasonsLabel")}{" "}
                {seasonTags
                  .map((s) => tDetail(`winter.seasons.${s}`))
                  .join(", ")}
              </span>
            ) : null}
            {indoorOutdoor ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sand-200/70 text-muted-ink">
                {tDetail("winter.indoorOutdoorLabel")}{" "}
                {tDetail(`winter.indoorOutdoor.${indoorOutdoor}`)}
              </span>
            ) : null}
            {budgetLevel ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sand-200/70 text-muted-ink">
                {tDetail("winter.budgetLabel")} {tDetail(`winter.budget.${budgetLevel}`)}
              </span>
            ) : null}
          </section>
        )}

        {galleryImages?.length ? (
          <section aria-label={tDetail("winter.galleryHeading")} className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {galleryImages.slice(0, 10).map((src, idx) => (
              <div key={src} className="relative shrink-0 w-32 h-24 rounded-lg overflow-hidden snap-start border border-sand-200/80 bg-sand-100">
                <Image
                  src={src}
                  alt={tDetail("winter.galleryAlt", { name: a.name, index: String(idx + 1) })}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            ))}
          </section>
        ) : null}

        <section>
          <p className="text-olive/90 text-lg sm:text-xl leading-relaxed break-words">{a.description}</p>
        </section>

        <section className={`${CARD.base} ${CARD.content} bg-aegean/5 border-aegean/20`}>
          <h2 className={`${TYPE.kicker} text-aegean ${SECTION.headingGap}`}>{tDetail("whyNow.title")}</h2>
          <ul className="space-y-2 text-sm text-olive/85">
            <li className="flex gap-2">
              <span className="text-aegean" aria-hidden>•</span>
              <span>
                {tDetail("whyNow.bestFor", { types: bestForTypes })}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-aegean" aria-hidden>•</span>
              <span>{tDetail("whyNow.regionFlow", { region: a.region })}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-aegean" aria-hidden>•</span>
              <span>{tDetail("whyNow.saveCompare")}</span>
            </li>
          </ul>
        </section>

        {bufferZoneNote && (
          <div className={`${CALLOUT.tip} ${CARD.content}`} role="note">
            <p className="text-sm font-medium text-charcoal flex items-start gap-2">
              <span className="text-golden-ink shrink-0" aria-hidden>{"⚠︎"}</span>
              <span>{tDetail("bufferZoneWarning")}</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
