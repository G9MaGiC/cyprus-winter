import type { Metadata } from "next";
import TrailsClient from "./TrailsClient";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { getTrailsItemListSchema } from "@/lib/trails-schema";
import { toSafeJsonForScript } from "@/lib/json-script";

const trailsAlternates = buildStrategyAAlternates("/trails");

export const metadata: Metadata = {
  title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
  description:
    "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length. Winter hiking tips. Sixteen degrees when home is six. Plan your hike.",
  alternates: trailsAlternates,
  openGraph: {
    title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
    description: "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length.",
    url: trailsAlternates.canonical,
    type: "website",
  },
};

export default function TrailsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(getTrailsItemListSchema()) }} />
      <TrailsClient />
    </>
  );
}
