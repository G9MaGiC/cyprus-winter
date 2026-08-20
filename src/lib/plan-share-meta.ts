import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { decodeItinerary } from "@/lib/itinerary-share";
import { planSegmentMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata, absoluteUrlForLocale } from "@/lib/locale-seo";
import {
  buildPlanShareCopy,
  buildPlanSharePreview,
} from "@/lib/plan-share-preview";
import { SITE_URL } from "@/lib/site-url";

const DEFAULT_OG_IMAGE = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export async function buildPlanPageMetadata(
  locale: string,
  planParam?: string | string[] | null
): Promise<Metadata> {
  const tMeta = await getTranslations({ locale, namespace: "plan.meta" });
  const tShare = await getTranslations({ locale, namespace: "plan.share" });
  const encoded = firstSearchParam(planParam ?? undefined);
  const preview = buildPlanSharePreview(encoded ? decodeItinerary(encoded) : null);
  const copy = buildPlanShareCopy(preview, {
    two: (a, b) => tShare("previewLineTwo", { a, b }),
    three: (a, b, c) => tShare("previewLineThree", { a, b, c }),
    more: (a, b, count) => tShare("previewLineMore", { a, b, count }),
    title: (places) => tShare("ogNamedTitle", { places }),
    description: (places, placeCount, dayCount) =>
      tShare("ogNamedDescription", { places, placeCount, dayCount }),
  });

  const title = copy?.title ?? tMeta("title");
  const description = copy?.description ?? tMeta("description");
  const sharePath = encoded && preview ? `/plan?plan=${encodeURIComponent(encoded)}` : "/plan";
  const ogImage = preview?.firstPlaceId
    ? `${SITE_URL}${
        preview.firstPlaceType === "trail"
          ? getTrailImage(preview.firstPlaceId)
          : getAttractionImage(preview.firstPlaceId, preview.firstPlaceType ?? "attraction")
      }`
    : DEFAULT_OG_IMAGE;
  const ogAlt = copy ? tShare("ogImageAlt", { places: copy.placesLine }) : tMeta("ogTitle");

  const base: Metadata = {
    ...planSegmentMeta,
    title,
    description,
    robots: preview ? { index: false, follow: true } : undefined,
    openGraph: {
      ...(planSegmentMeta.openGraph ?? { type: "website" }),
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };

  const meta = applyLocaleToMetadata(base, "/plan", locale);
  if (sharePath !== "/plan") {
    const shareUrl = absoluteUrlForLocale(sharePath, locale);
    return {
      ...meta,
      openGraph: meta.openGraph ? { ...meta.openGraph, url: shareUrl } : { url: shareUrl },
    };
  }
  return meta;
}
