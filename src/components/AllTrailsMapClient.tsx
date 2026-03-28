"use client";

import dynamic from "next/dynamic";
import type { Trail } from "@/data/trails";
import { useTranslations } from "next-intl";
import MapErrorBoundary from "@/components/MapErrorBoundary";

const AllTrailsMap = dynamic(() => import("./AllTrailsMap"), {
  ssr: false,
  loading: () => (
    <AllTrailsMapLoading />
  ),
});

function AllTrailsMapLoading() {
  const t = useTranslations("common");

  return (
    <div
      className="h-[320px] sm:h-[360px] rounded-xl border border-sand-200/70 bg-sand-100/80 animate-pulse flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-sm text-olive/60">{t("loading.map")}</p>
    </div>
  );
}

type AllTrailsMapClientProps = {
  trails: Trail[];
  className?: string;
};

export default function AllTrailsMapClient({ trails, className }: AllTrailsMapClientProps) {
  return (
    <MapErrorBoundary>
      <AllTrailsMap trails={trails} className={className} />
    </MapErrorBoundary>
  );
}
