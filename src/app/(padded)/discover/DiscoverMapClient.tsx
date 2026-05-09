"use client";

import dynamic from "next/dynamic";
import type { DiscoverMapPlace } from "./DiscoverMap";
import { useTranslations } from "next-intl";

const DiscoverMap = dynamic(() => import("./DiscoverMap").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="min-h-[280px] aspect-video w-full rounded-xl overflow-hidden border border-sand-200/80 bg-sand-200/70 flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="h-4 w-24 rounded-lg bg-sand-300/50" aria-hidden />
      <p className="text-sm text-olive/60 animate-none">
        <DiscoverMapLoadingLabel />
      </p>
    </div>
  ),
});

type DiscoverMapClientProps = {
  places: DiscoverMapPlace[];
};

function DiscoverMapLoadingLabel() {
  const tDiscover = useTranslations("discover");
  return tDiscover("map.loading");
}

export default function DiscoverMapClient({ places }: DiscoverMapClientProps) {
  return <DiscoverMap places={places} className="w-full" />;
}
