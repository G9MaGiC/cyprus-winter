import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { SITE_URL } from "@/lib/site-url";
import Image from "next/image";
import { trails } from "@/data/trails";
import { LAYOUT, CARD, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { getTrailImage } from "@/lib/cyprus-images";
import { DifficultyBadge } from "@/components/TrailBadges";
import type { Trail } from "@/data/trails";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Best Troodos Trails in December | Cyprus Winter",
  description:
    "Troodos trails in December: Artemis, Atalante, Caledonia Falls. Clear paths, quiet slopes. What to pack, conditions, snow notes. Cyprus winter hiking guide.",
  alternates: { canonical: `${SITE_URL}/guides/troodos-december` },
};

const troodosTrails = trails.filter((t) => t.region === "Troodos");

/** December-friendly: often clear, good conditions, or iconic winter pick */
const decemberPicks = troodosTrails.filter((t) =>
  ["atalante", "artemis", "persephone", "caledonia-falls", "millomeris-falls"].includes(t.id)
);

function TrailCard({ trail }: { trail: Trail }) {
  const durationH = Math.round(trail.durationMin / 60);
  return (
    <AppLink
      href={`/trails/${trail.id}`}
      className={`block rounded-xl overflow-hidden group ${CARD.base} ${CARD.hover} ${CARD.link}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:shrink-0 relative aspect-video sm:w-48 sm:aspect-square overflow-hidden bg-olive/10">
          <Image
            src={getTrailImage(trail.id)}
            alt={`${trail.name}, ${trail.region} — ${trail.lengthKm} km ${trail.difficulty} trail`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 192px"
          />
          <div className="absolute bottom-3 left-3">
            <DifficultyBadge difficulty={trail.difficulty} />
          </div>
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-display text-lg font-semibold text-olive group-hover:text-terracotta">
            {trail.name}
          </h3>
          <p className="text-sm text-olive/70 mt-0.5">
            {trail.lengthKm} km · ~{durationH}h
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
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/trails"
        backLabel={tNav("trails")}
        title="Best Troodos Trails in December"
        description="December in Troodos: crisp air, quiet trails, often clear before peak snow. Atalante and Artemis stay open when higher routes hold snow; Caledonia Falls runs strong after rain."
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("trails"), href: "/trails" },
          { label: tCommon("breadcrumbs.troodosDecember"), href: "/guides/troodos-december", isCurrent: true },
        ]}
      />

      <div className="prose prose-olive max-w-none mb-12">
        <p className="text-olive/80">
          December hits the sweet spot: ski season hasn&apos;t fully started, trails are usually clear, and the villages are quiet. Pack layers—temps can dip to 2°C at elevation. Check{" "}
          <AppLink href="/trails" className={SECTION.aegeanLink}>
            trail conditions
          </AppLink>{" "}
          before you go; after cold snaps, higher trails can be icy.
        </p>
      </div>

      <section aria-labelledby="december-picks">
        <h2 id="december-picks" className={`font-display text-xl font-semibold text-olive ${SECTION.headingGap}`}>
          December picks
        </h2>
        <div className="space-y-4">
          {decemberPicks.map((trail) => (
            <TrailCard key={trail.id} trail={trail} />
          ))}
        </div>
      </section>

      <section aria-labelledby="all-troodos" className="mt-12">
        <h2 id="all-troodos" className={`font-display text-xl font-semibold text-olive ${SECTION.headingGap}`}>
          All Troodos trails
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {troodosTrails.map((trail) => (
            <TrailCard key={trail.id} trail={trail} />
          ))}
        </div>
      </section>

      <p className="mt-12 text-center text-olive/70 text-sm">
        <AppLink href="/regions/troodos" className={SECTION.aegeanLink}>
          Troodos region
        </AppLink>
        {" · "}
        <AppLink href="/weather" className={SECTION.aegeanLink}>
          Weather by month
        </AppLink>
      </p>
    </div>
  );
}
