import type { Metadata } from "next";
import TrailsClient from "./TrailsClient";
import { SITE_URL } from "@/lib/site-url";
import { getTrailsItemListSchema } from "@/lib/trails-schema";
import { toSafeJsonForScript } from "@/lib/json-script";

export const metadata: Metadata = {
  title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
  description:
    "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length. Winter hiking tips. Sixteen degrees when home is six. Plan your hike.",
  alternates: { canonical: `${SITE_URL}/trails` },
  openGraph: {
    title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
    description: "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length.",
    url: `${SITE_URL}/trails`,
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
