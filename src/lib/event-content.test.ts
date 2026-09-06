import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { winterEvents } from "@/data/events";
import {
  LOCALIZED_EVENT_FIELDS,
  LOCALIZED_EVENT_IDS,
} from "@/lib/event-content-ids";

/**
 * Guard for the winter-event overlay — mirrors secret-gem-content.test.ts
 * while the class ships in slices: every covered id must exist in data,
 * every covered field must be non-empty in all 7 catalogs, EN must mirror
 * the base record verbatim, and the el `name` must equal the record's
 * `nameEl` where one exists (the Greek-first projection and the overlay
 * must never disagree). The set-equality assertion lands with slice 2,
 * when the class completes.
 */

const LOCALES = ["en", "de", "el", "pl", "ro", "fr", "he"] as const;

function loadCatalog(locale: string): Record<string, unknown> {
  const p = path.join(__dirname, "../../messages", `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function eventsNs(locale: string): Record<string, Record<string, string>> {
  const ns = (
    loadCatalog(locale) as { data?: { events?: Record<string, Record<string, string>> } }
  ).data?.events;
  expect(ns, `${locale}: data.events namespace missing`).toBeTruthy();
  return ns as Record<string, Record<string, string>>;
}

describe("winter-event content overlay (data-layer arc, class 6)", () => {
  it("every registry id exists in data and every catalog id is registered", () => {
    for (const id of LOCALIZED_EVENT_IDS) {
      expect(
        winterEvents.some((e) => e.id === id),
        `LOCALIZED_EVENT_IDS contains unknown event id ${id}`
      ).toBe(true);
    }
    for (const locale of LOCALES) {
      expect(new Set(Object.keys(eventsNs(locale)))).toEqual(LOCALIZED_EVENT_IDS);
    }
  });

  for (const locale of LOCALES) {
    it(`every covered field has a non-empty ${locale} catalog string`, () => {
      const ns = eventsNs(locale);
      for (const event of winterEvents) {
        if (!LOCALIZED_EVENT_IDS.has(event.id)) continue;
        for (const field of LOCALIZED_EVENT_FIELDS) {
          if (!event[field]) continue;
          const value = ns[event.id]?.[field];
          expect(
            typeof value === "string" && value.trim().length > 0,
            `${locale}: data.events.${event.id}.${field} missing or empty`
          ).toBe(true);
        }
      }
    });
  }

  it("the EN catalog mirrors the base record verbatim", () => {
    const ns = eventsNs("en");
    for (const event of winterEvents) {
      if (!LOCALIZED_EVENT_IDS.has(event.id)) continue;
      for (const field of LOCALIZED_EVENT_FIELDS) {
        if (!event[field]) continue;
        expect(ns[event.id]?.[field], `en: data.events.${event.id}.${field}`).toBe(event[field]);
      }
    }
  });

  it("the el name equals the record's nameEl where one exists", () => {
    const ns = eventsNs("el");
    for (const event of winterEvents) {
      if (!LOCALIZED_EVENT_IDS.has(event.id) || !event.nameEl) continue;
      expect(ns[event.id]?.name, `el: data.events.${event.id}.name`).toBe(event.nameEl);
    }
  });
});
