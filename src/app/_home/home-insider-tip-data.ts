import "server-only";

import { winterTipsGeneral, winterTipsHiking, winterTipsPractical, type WinterTip } from "@/data/winter-tips";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { getTranslations } from "next-intl/server";

const allTips = [...winterTipsGeneral, ...winterTipsHiking, ...winterTipsPractical];

export type HomeInsiderTipData = WinterTip;

export async function getHomeInsiderTip(locale?: string): Promise<HomeInsiderTipData> {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");
  const tip = pickDailyWithKey(allTips, "insider-tip");

  return {
    ...tip,
    title: t(`insiderTips.${tip.id}.title`),
    body: t(`insiderTips.${tip.id}.body`),
  };
}
