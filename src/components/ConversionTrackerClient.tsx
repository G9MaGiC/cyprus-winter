"use client";

import dynamic from "next/dynamic";

const ConversionTracker = dynamic(
  () => import("@/components/ConversionTracker"),
  { ssr: false }
);

export default function ConversionTrackerClient() {
  return <ConversionTracker />;
}
