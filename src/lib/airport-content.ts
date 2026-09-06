import "server-only";
import { getTranslations } from "next-intl/server";
import type { Airport } from "@/data/airport";

/**
 * BUG-110 message-overlay pattern for the arrival guide — data-layer arc,
 * class 2 (after weather): per-locale copy lives in messages under
 * `data.airport.{code}.*` and is overlaid onto the base TS record at render.
 * `code` and `name` stay the EN base (proper names); `city` localizes (the
 * display name natives and signs use), every transport option's prose and
 * every tip localize with figures carried verbatim from the base. The
 * concierge tool and plan-sustainability keep reading the un-overlaid base
 * (EN-by-contract, same as ai-context).
 */

export const transportSlug = (type: string) => type.toLowerCase().replace(/\s+/g, "-");

export async function localizeAirports(
  list: Airport[],
  locale?: string
): Promise<Airport[]> {
  const t = locale
    ? await getTranslations({ locale, namespace: "data.airport" })
    : await getTranslations("data.airport");
  return list.map((airport) => {
    const code = airport.code.toLowerCase();
    return {
      ...airport,
      city: t(`${code}.city`),
      transport: airport.transport.map((opt) => {
        const slug = transportSlug(opt.type);
        return {
          ...opt,
          type: t(`${code}.transport.${slug}.type`),
          description: t(`${code}.transport.${slug}.description`),
          approxCost: t(`${code}.transport.${slug}.approxCost`),
          ...(opt.duration ? { duration: t(`${code}.transport.${slug}.duration`) } : {}),
          ...(opt.tip ? { tip: t(`${code}.transport.${slug}.tip`) } : {}),
        };
      }),
      tips: airport.tips.map((_, i) => t(`${code}.tips.${i}`)),
    };
  });
}
