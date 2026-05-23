import "server-only";

import { getTranslations } from "next-intl/server";
import type { HomeSearchSectionViewProps } from "@/app/_home/HomeSearchSectionView";

export async function getHomeSearchSectionProps(locale?: string): Promise<HomeSearchSectionViewProps> {
  const tHome = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return {
    srHeading: tHome("search.srHeading"),
    kicker: tHome("search.kicker"),
    placeholder: tHome("search.placeholder"),
  };
}
