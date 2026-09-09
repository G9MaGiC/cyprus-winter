import "server-only";
import { getTranslations } from "next-intl/server";
import type { WineRoute } from "@/data/wine-routes";

/**
 * BUG-110 message-overlay pattern for the wine-route intros — data-layer arc,
 * class 3: per-locale copy lives under `data.wineRoutes.{slug}.*` and is
 * overlaid onto the base TS record at render. `title` localizes too — the
 * route names are Greek place-words (Krasochoria, Commandaria) that take
 * native forms on el/he and are spliced into localized ICU frames
 * (`routeTitle`, `wineRouteMetadata`); Latin locales keep the Latin names.
 * Winery lists, varieties and JSON-LD keep reading the EN base.
 */

const FIELDS = ["title", "description", "winterTip"] as const;

export async function localizeWineRoute(
  route: WineRoute,
  locale?: string
): Promise<WineRoute> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.wineRoutes" })
    : await getTranslations("data.wineRoutes");
  const overlaid: Record<string, string> = {};
  for (const field of FIELDS) {
    overlaid[field] = t(`${route.slug}.${field}`);
  }
  return { ...route, ...overlaid };
}

export async function localizeWineRoutes(
  routes: WineRoute[],
  locale?: string
): Promise<WineRoute[]> {
  return Promise.all(routes.map((route) => localizeWineRoute(route, locale)));
}
