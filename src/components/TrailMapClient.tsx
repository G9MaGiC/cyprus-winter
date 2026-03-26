"use client";

import dynamic from "next/dynamic";
import type { Trail } from "@/data/trails";
import { useTranslations } from "next-intl";
import MapErrorBoundary from "@/components/MapErrorBoundary";

function TrailMapLoading() {
  const tCommon = useTranslations("common");
  return (
    <div className="h-[280px] sm:h-[320px] rounded-xl border border-sand-200/70 bg-sand-100/80 animate-pulse flex items-center justify-center">
      <p className="text-sm text-olive/60">{tCommon("loading.map")}</p>
    </div>
  );
}

const TrailMap = dynamic(() => import("./TrailMap"), {
  ssr: false,
  loading: () => <TrailMapLoading />,
});

type TrailMapClientProps = {
  trail: Trail;
  className?: string;
};

export default function TrailMapClient({ trail, className }: TrailMapClientProps) {
  return (
    <MapErrorBoundary>
      <TrailMap trail={trail} className={className} />
    </MapErrorBoundary>
  );
}
