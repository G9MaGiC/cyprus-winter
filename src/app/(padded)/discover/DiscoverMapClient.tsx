"use client";

import dynamic from "next/dynamic";
import type { DiscoverMapPlace } from "./DiscoverMap";
import type { MapBounds } from "@/lib/discover-map-focus";
import { useTranslations } from "next-intl";

const DiscoverMap = dynamic(() => import("./DiscoverMap").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="min-h-[280px] aspect-video w-full rounded-xl overflow-hidden border border-sand-200/80 bg-sand-200/50 flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="h-4 w-24 rounded-lg bg-sand-300/50" aria-hidden />
      <p className="text-sm text-muted-ink animate-none">
        <DiscoverMapLoadingLabel />
      </p>
    </div>
  ),
});

type DiscoverMapClientProps = {
  places: DiscoverMapPlace[];
  className?: string;
  focusBounds?: MapBounds | null;
  highlightIds?: Set<string>;
  dimUnhighlighted?: boolean;
  showFooter?: boolean;
};

function DiscoverMapLoadingLabel() {
  const tDiscover = useTranslations("discover");
  return tDiscover("map.loading");
}

export default function DiscoverMapClient({
  places,
  className,
  focusBounds,
  highlightIds,
  dimUnhighlighted,
  showFooter,
}: DiscoverMapClientProps) {
  return (
    <DiscoverMap
      places={places}
      className={className}
      focusBounds={focusBounds}
      highlightIds={highlightIds}
      dimUnhighlighted={dimUnhighlighted}
      showFooter={showFooter}
    />
  );
}
