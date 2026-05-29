import type { Metadata } from "next";
import TrailsClient from "./TrailsClient";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { SITE_URL } from "@/lib/site-url";
import { getTrailsItemListSchema } from "@/lib/trails-schema";
import { toSafeJsonForScript } from "@/lib/json-script";
import { getTranslations } from "next-intl/server";
import { preload } from "react-dom";

const TRAILS_HERO_IMAGE = "/images/cyprus/cyprus-trail-troodos.jpg";

const trailsAlternates = buildStrategyAAlternates("/trails");

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trails.page");
  const title = t("meta.title");
  const description = t("meta.description");
  const ogDescription = t("meta.ogDescription");
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-trail-troodos.jpg`;
  return {
    title,
    description,
    alternates: trailsAlternates,
    openGraph: {
      title,
      description: ogDescription,
      url: trailsAlternates.canonical,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Troodos trail, Cyprus winter",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

export default function TrailsPage() {
  preload(TRAILS_HERO_IMAGE, { as: "image" });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(getTrailsItemListSchema()) }} />
      <TrailsClient />
    </>
  );
}
