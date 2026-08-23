import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import Image from "next/image";
import { trails } from "@/data/trails";
import { LAYOUT, CARD, SECTION, TYPE, MEDIA } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { getTrailImage } from "@/lib/cyprus-images";
import { DifficultyBadge } from "@/components/TrailBadges";
import type { Trail } from "@/data/trails";
import TroodosDecemberFooter from "@/components/TroodosDecemberFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import { getLocale, getTranslations } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("guidesTroodosDecember", locale);
}

const troodosTrails = trails.filter((t) => t.region === "Troodos");

/** December-friendly: often clear, good conditions, or iconic winter pick (gentler first) */
const DECEMBER_PICK_IDS = [
  "artemis",
  "persephone",
  "millomeris-falls",
  "caledonia-falls",
  "atalante",
] as const;

const decemberPicks = DECEMBER_PICK_IDS.map((id) =>
  troodosTrails.find((t) => t.id === id)
).filter((t): t is Trail => t != null);

function TrailCard({
  trail,
  imageAlt,
  durationLabel,
}: {
  trail: Trail;
  imageAlt: string;
  durationLabel: string;
}) {
  return (
    <AppLink
      href={`/trails/${trail.id}`}
      className={`block rounded-xl overflow-hidden group ${CARD.base} ${CARD.hover} ${CARD.link}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:shrink-0 relative aspect-video sm:w-48 sm:aspect-square overflow-hidden bg-olive/10">
          <Image
            src={getTrailImage(trail.id)}
            alt={imageAlt}
            fill
            className={`${MEDIA.hoverImage} duration-300`}
            sizes="(max-width: 640px) 100vw, 192px"
          />
          <div className="absolute bottom-3 left-3">
            <DifficultyBadge difficulty={trail.difficulty} />
          </div>
        </div>
        <div className="p-4 flex-1">
          <h3 className={`${TYPE.cardTitle}`}>
            {trail.name}
          </h3>
          <p className="text-sm text-olive/70 mt-0.5">
            {durationLabel}
          </p>
          <p className="text-sm text-olive/80 mt-2 line-clamp-2">
            {trail.winterNotes ?? trail.description}
          </p>
        </div>
      </div>
    </AppLink>
  );
}

export default async function TroodosDecemberPage() {
  const [tNav, tCommon, tGuide] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("guides.troodosDecember"),
  ]);
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/trails"
        backLabel={tNav("trails")}
        title={tGuide("header.title")}
        description={tGuide("header.description")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("trails"), href: "/trails" },
          { label: tCommon("breadcrumbs.troodosDecember"), href: "/guides/troodos-december", isCurrent: true },
        ]}
      />

      <div className="prose prose-olive max-w-none mb-12">
        <p className="text-olive/80">
          {tGuide.rich("intro.body", {
            trailConditionsLink: (chunks) => (
              <AppLink href="/trails" className={SECTION.aegeanLink}>
                {chunks}
              </AppLink>
            ),
          })}
        </p>
      </div>

      <section aria-labelledby="december-picks">
        <h2 id="december-picks" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
          {tGuide("sections.decemberPicks")}
        </h2>
        <div className="space-y-4">
          {decemberPicks.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              imageAlt={tGuide("cards.imageAlt", {
                name: trail.name,
                region: trail.region,
                km: trail.lengthKm,
                difficulty: trail.difficulty,
              })}
              durationLabel={tGuide("cards.duration", {
                km: trail.lengthKm,
                hours: Math.round(trail.durationMin / 60),
              })}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="all-troodos" className="mt-12">
        <h2 id="all-troodos" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
          {tGuide("sections.allTroodos")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {troodosTrails.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              imageAlt={tGuide("cards.imageAlt", {
                name: trail.name,
                region: trail.region,
                km: trail.lengthKm,
                difficulty: trail.difficulty,
              })}
              durationLabel={tGuide("cards.duration", {
                km: trail.lengthKm,
                hours: Math.round(trail.durationMin / 60),
              })}
            />
          ))}
        </div>
      </section>

      <span id="troodos-december-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <TroodosDecemberFooter />
      <StickyPlanBarBlock sentinelId="troodos-december-plan-sentinel" />
    </div>
  );
}
