"use client";

import dynamic from "next/dynamic";
import type { DiscoverMapPlace } from "./DiscoverMap";

const DiscoverMap = dynamic(() => import("./DiscoverMap").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="min-h-[280px] rounded-xl border border-sand-200/70 bg-sand-100/50 flex items-center justify-center">
      <p className="text-sm text-olive/60">Loading map…</p>
    </div>
  ),
});

type DiscoverMapClientProps = {
  places: DiscoverMapPlace[];
};

export default function DiscoverMapClient({ places }: DiscoverMapClientProps) {
  return <DiscoverMap places={places} className="w-full" />;
}
