import "server-only";
import { getTranslations } from "next-intl/server";
import type { CyclingRoute } from "@/lib/cycling-route-types";

/**
 * BUG-110 message-overlay pattern for the official cycling routes —
 * data-layer arc, class 5: per-locale copy lives under
 * `data.cyclingRoutes.{id}.*` and is overlaid onto the base TS record before
 * the list crosses the client boundary (the section component receives the
 * localized array as a prop). `name` stays the EN base per the register's
 * naming policy; distances, GPX links and Visit Cyprus URLs are untouched.
 */

export async function localizeCyclingRoutes(
  routes: CyclingRoute[],
  locale?: string
): Promise<CyclingRoute[]> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.cyclingRoutes" })
    : await getTranslations("data.cyclingRoutes");
  return routes.map((route) => ({
    ...route,
    description: t(`${route.id}.description`),
    ...(route.winterNote ? { winterNote: t(`${route.id}.winterNote`) } : {}),
  }));
}
