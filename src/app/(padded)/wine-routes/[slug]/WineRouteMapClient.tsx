"use client";

import dynamic from "next/dynamic";
import type { Winery } from "@/data/wineries";
import { useTranslations } from "next-intl";

function WineRouteMapLoading() {
  const tCommon = useTranslations("common");
  return (
    <div className="h-[320px] rounded-xl border border-sand-200/70 bg-sand-100/80 animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-ink">{tCommon("loading.map")}</p>
    </div>
  );
}

// Leaflet touches `window` at module scope, so the map must never be
// evaluated during SSR (BUG-352: every /wine-routes/[slug] render logged a
// caught ReferenceError before this wrapper).
const WineRouteMap = dynamic(() => import("./WineRouteMap"), {
  ssr: false,
  loading: () => <WineRouteMapLoading />,
});

type WineRouteMapClientProps = {
  routeTitle: string;
  center: { lat: number; lng: number };
  wineries: Winery[];
};

export default function WineRouteMapClient(props: WineRouteMapClientProps) {
  return <WineRouteMap {...props} />;
}
