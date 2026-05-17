import "server-only";

import { homeEditorsPicks, type HomeEditorialPick } from "@/data/home";
import { getTranslations } from "next-intl/server";

export async function getHomeEditorsPicks(locale?: string): Promise<HomeEditorialPick[]> {
  const t = locale
    ? await getTranslations({ locale, namespace: "home" })
    : await getTranslations("home");

  return homeEditorsPicks.map((item) => ({
    ...item,
    title: t(`editorsPicks.items.${item.id}.title`),
    desc: t(`editorsPicks.items.${item.id}.desc`),
    imageAlt: t(`editorsPicks.items.${item.id}.imageAlt`),
  }));
}
