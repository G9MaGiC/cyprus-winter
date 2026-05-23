import "server-only";

import { homeFeaturedWineries, type HomeFeaturedWinery } from "@/data/home";
import { getTranslations } from "next-intl/server";

export type LocalizedFeaturedWinery = HomeFeaturedWinery & {
  name: string;
};

export async function getHomeFeaturedWineries(locale?: string): Promise<LocalizedFeaturedWinery[]> {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return homeFeaturedWineries.map((w) => ({
    ...w,
    title: t(`featuredWineries.items.${w.wineryId}.title`),
    name: t(`featuredWineries.items.${w.wineryId}.title`),
    subtitle: t(`featuredWineries.items.${w.wineryId}.subtitle`),
    imageAlt: t(`featuredWineries.items.${w.wineryId}.imageAlt`),
  }));
}
