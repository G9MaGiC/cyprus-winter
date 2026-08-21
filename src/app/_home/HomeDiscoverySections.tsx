"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useItinerary } from "@/hooks/useItinerary";
import HomeSection from "@/app/_home/HomeSection";
import EditorsPicks from "@/app/_home/EditorsPicks";
import BookTastings from "@/app/_home/BookTastings";
import { BookTastingsSkeleton } from "@/app/_home/skeletons";

type HomeDiscoverySectionsProps = {
  locale?: string;
};

/**
 * Hides editor picks and book tastings when the visitor already has plan items —
 * reduces funnel noise for return planners without changing copy.
 */
export default function HomeDiscoverySections({ locale }: HomeDiscoverySectionsProps) {
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const { hasContent, hydrated } = useItinerary();

  if (hydrated && hasContent) {
    return null;
  }

  return (
    <>
      <HomeSection
        id="editors-picks-heading"
        title={tHome("editorsPicks.title")}
        kicker={tHome("editorsPicksKicker")}
        subtitle={tHome("discoverCurated")}
        alt
      >
        <EditorsPicks locale={locale} />
      </HomeSection>

      <HomeSection
        id="book-tastings-heading"
        title={tCommon("bookTastings")}
        kicker={tHome("bookTastings.kicker")}
        subtitle={tHome("bookTastings.subtitle")}
      >
        <Suspense fallback={<BookTastingsSkeleton />}>
          <BookTastings locale={locale} />
        </Suspense>
      </HomeSection>
    </>
  );
}
