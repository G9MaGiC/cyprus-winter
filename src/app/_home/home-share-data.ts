import "server-only";

import { getTranslations } from "next-intl/server";
import type { HomeShareSectionViewProps } from "@/app/_home/HomeShareSectionView";

export async function getHomeShareSectionProps(
  sharePath: string,
  locale?: string
): Promise<HomeShareSectionViewProps> {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return {
    heading: t("share.heading"),
    body: t("share.body"),
    shareWithLabel: t("share.shareWithLabel"),
    shareText: t("share.shareText"),
    shareViaAria: t("share.shareViaAria"),
    sharePath,
  };
}
