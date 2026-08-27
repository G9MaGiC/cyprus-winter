#!/usr/bin/env node
/**
 * Localize book guide/winery detail SEO meta for tier-1 locales (de/el/pl).
 * Beta fr/he/ro already translated. Run: node scripts/i18n/patch-tier1-book-meta.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {Record<string, Record<string, string>>} */
const overrides = {
  de: {
    "book.pages.guideDetail.meta.title":
      "Geführte Wanderung buchen | {guideName} | Cyprus Winter",
    "book.pages.guideDetail.meta.description":
      "Geführte Winterwanderung mit {guideName} in {region} anfragen. Kleine Gruppen, lokales Know-how. Bestätigung per E‑Mail.",
    "book.pages.guideDetail.metaNotFound": "Nicht gefunden",
    "book.pages.wineryDetail.meta.title":
      "Verkostung buchen | {wineryName} | Cyprus Winter",
    "book.pages.wineryDetail.meta.description":
      "Winter-Verkostung bei {wineryName} in {region} buchen. Gemütliches Feuer, Heizstrahler, oft schenkt der Besitzer ein. Bestätigung per E‑Mail. Im Voraus buchen. Cyprus Winter.",
  },
  el: {
    "book.pages.guideDetail.meta.title":
      "Κράτηση πεζοπορίας με οδηγό | {guideName} | Cyprus Winter",
    "book.pages.guideDetail.meta.description":
      "Αίτημα για χειμερινή πεζοπορία με {guideName} στην περιοχή {region}. Μικρές ομάδες, τοπική εμπειρία. Επιβεβαίωση με email.",
    "book.pages.guideDetail.metaNotFound": "Δεν βρέθηκε",
    "book.pages.wineryDetail.meta.title":
      "Κράτηση γευσιγνωσίας | {wineryName} | Cyprus Winter",
    "book.pages.wineryDetail.meta.description":
      "Κλείστε χειμερινή γευσιγνωσία στο {wineryName} στην περιοχή {region}. Ζεστή φωτιά, θερμάστρες, συχνά σερβίρει ο ιδιοκτήτης. Επιβεβαίωση με email. Κλείστε νωρίς. Cyprus Winter.",
  },
  pl: {
    "book.pages.guideDetail.meta.title":
      "Zarezerwuj wędrówkę z przewodnikiem | {guideName} | Cyprus Winter",
    "book.pages.guideDetail.meta.description":
      "Poproś o zimową wędrówkę z przewodnikiem {guideName} w regionie {region}. Małe grupy, lokalna wiedza. Potwierdzenie mailem.",
    "book.pages.guideDetail.metaNotFound": "Nie znaleziono",
    "book.pages.wineryDetail.meta.title":
      "Zarezerwuj degustację | {wineryName} | Cyprus Winter",
    "book.pages.wineryDetail.meta.description":
      "Zarezerwuj zimową degustację w {wineryName} w regionie {region}. Przytulny ogień, grzejniki, często leje sam właściciel. Potwierdzenie mailem. Rezerwuj z wyprzedzeniem. Cyprus Winter.",
  },
};

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [locale, map] of Object.entries(overrides)) {
  const file = path.join(root, "messages", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const [key, value] of Object.entries(map)) {
    setPath(data, key, value);
    n++;
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: wrote ${n} keys`);
}
