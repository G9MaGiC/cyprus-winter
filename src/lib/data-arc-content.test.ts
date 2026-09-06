import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { WINE_ROUTES } from "@/data/wine-routes";
import { natureExcursions } from "@/data/nature-excursions";
import { cyclingRoutes } from "@/data/cycling-routes";

/**
 * Guards for data-layer arc classes 3–5 (wine routes, nature excursions,
 * official cycling routes) — one shared harness, same contract as the
 * weather and airport guards: catalog structure equals the data structure
 * exactly (ids both ways, optional winterNote present exactly where the
 * base has one), every field non-empty in all 7 locales, EN mirroring the
 * data verbatim.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

type Ns = Record<string, Record<string, string>>;

function loadNs(locale: string, ns: string): Ns {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../messages", `${locale}.json`), "utf8")
  ) as { data?: Record<string, Ns> };
  const section = catalog.data?.[ns];
  expect(section, `${locale}: data.${ns} namespace missing`).toBeTruthy();
  return section as Ns;
}

type ClassSpec = {
  ns: string;
  items: { id: string; fields: Record<string, string> }[];
};

const CLASSES: ClassSpec[] = [
  {
    ns: "wineRoutes",
    items: WINE_ROUTES.map((r) => ({
      id: r.slug,
      fields: { title: r.title, description: r.description, winterTip: r.winterTip },
    })),
  },
  {
    ns: "natureExcursions",
    items: natureExcursions.map((e) => ({
      id: e.id,
      fields: {
        description: e.description,
        ...(e.winterNote ? { winterNote: e.winterNote } : {}),
      },
    })),
  },
  {
    ns: "cyclingRoutes",
    items: cyclingRoutes.map((r) => ({
      id: r.id,
      fields: {
        description: r.description,
        ...(r.winterNote ? { winterNote: r.winterNote } : {}),
      },
    })),
  },
];

for (const spec of CLASSES) {
  describe(`data.${spec.ns} overlay`, () => {
    it("catalog structure equals the data structure exactly, in every locale", () => {
      for (const locale of LOCALES) {
        const ns = loadNs(locale, spec.ns);
        expect(new Set(Object.keys(ns))).toEqual(new Set(spec.items.map((i) => i.id)));
        for (const item of spec.items) {
          expect(
            new Set(Object.keys(ns[item.id])),
            `${locale}: data.${spec.ns}.${item.id} fields`
          ).toEqual(new Set(Object.keys(item.fields)));
        }
      }
    });

    for (const locale of LOCALES) {
      it(`every field is a non-empty ${locale} string`, () => {
        const ns = loadNs(locale, spec.ns);
        for (const item of spec.items) {
          for (const field of Object.keys(item.fields)) {
            const value = ns[item.id]?.[field];
            expect(
              typeof value === "string" && value.trim().length > 0,
              `${locale}: data.${spec.ns}.${item.id}.${field} missing or empty`
            ).toBe(true);
          }
        }
      });
    }

    it("the EN catalog mirrors the base record verbatim", () => {
      const ns = loadNs("en", spec.ns);
      for (const item of spec.items) {
        for (const [field, value] of Object.entries(item.fields)) {
          expect(ns[item.id]?.[field], `en: data.${spec.ns}.${item.id}.${field}`).toBe(value);
        }
      }
    });
  });
}
