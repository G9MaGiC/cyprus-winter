"use client";

import dynamic from "next/dynamic";
import type { Trail } from "@/data/trails";

const TrailMap = dynamic(() => import("./TrailMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] sm:h-[340px] rounded-lg border border-sand-200/70 bg-sand-100/80 animate-pulse flex items-center justify-center">
      <p className="text-sm text-olive/60">Loading map…</p>
    </div>
  ),
});

type TrailMapClientProps = {
  trail: Trail;
  className?: string;
};

export default function TrailMapClient({ trail, className }: TrailMapClientProps) {
  return <TrailMap trail={trail} className={className} />;
}
