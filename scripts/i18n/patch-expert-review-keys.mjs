/**
 * Expert review remediation i18n keys. Run: node scripts/i18n/patch-expert-review-keys.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

function setNested(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function deepMergeMissing(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return;
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!(k in target) || typeof target[k] !== "object" || target[k] === null) target[k] = {};
      deepMergeMissing(target[k], v);
    } else if (!(k in target)) {
      target[k] = v;
    }
  }
}

const en = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf8"));

/** @type {Record<string, Record<string, string>>} */
const OVERRIDES = {
  el: {
    "home.editorsPicks.title": "Επιλογές συντάκτη",
    "plan.share.copyAndShare": "Αντιγραφή & κοινοποίηση",
    "plan.share.placesLabel": "μέρη",
    "plan.share.daysLabel": "ημέρες",
    "plan.share.placesCount": "{count, plural, one {# μέρος} other {# μέρη}}",
    "plan.share.daysCount": "{count, plural, one {# ημέρα} other {# ημέρες}}",
    "plan.share.copyLink": "Αντιγραφή συνδέσμου",
    "plan.share.linkCopied": "Ο σύνδεσμος αντιγράφηκε",
    "plan.share.copyItinerary": "Αντιγραφή προγράμματος (κείμενο)",
    "plan.share.copied": "Αντιγράφηκε",
    "plan.share.shareTextPrefix": "Το πρόγραμμά μου για την Κύπρο τον χειμώνα —",
    "common.placeTypes.beach": "Παραλία",
    "common.placeTypes.ancientSite": "Αρχαίος χώρος",
    "common.placeTypes.village": "Χωριό",
    "common.placeTypes.monastery": "Μοναστήρι",
    "common.placeTypes.winery": "Οινοποιείο",
    "common.placeTypes.restaurant": "Εστιατόριο",
    "common.placeTypes.trail": "Μονοπάτι",
    "common.placeTypes.event": "Εκδήλωση",
    "home.rightNow.card.defaultTease": "Αξίζει επίσκεψη τον χειμώνα.",
    "airport.page.footer.askAi": "Ρωτήστε το AI",
    "airport.page.footer.askAiAria": "Ρωτήστε το AI για άφιξη και μεταφορές",
    "airport.page.aria.actions": "Ενέργειες σελίδας αεροδρομίου",
    "home.editorsPicks.items.omodos.title": "Όμοδος",
    "home.editorsPicks.items.omodos.desc": "Πλακόστρωτοι δρόμοι, ζιβανιά, καφές στην καρδιά της οινοποιίας",
    "home.editorsPicks.items.omodos.imageAlt": "Χωριό Όμοδος, οινοχώρα, πλακόστρωτοι δρόμοι—χειμώνας Κύπρος",
    "home.editorsPicks.items.pafos-mosaics.title": "Μωσαϊκά Πάφου",
    "home.editorsPicks.items.pafos-mosaics.desc": "Ρωμαϊκά μωσαϊκά σε απαλό χειμερινό φως",
    "home.editorsPicks.items.pafos-mosaics.imageAlt": "Ρωμαϊκά μωσαϊκά στην Πάφο σε απαλό χειμερινό φως—Κύπρος",
    "home.editorsPicks.items.artemis.title": "Μονοπάτι Άρτεμις",
    "home.editorsPicks.items.artemis.desc": "7 χλμ πευκόδασος και θέα από την κορυφή",
    "home.editorsPicks.items.artemis.imageAlt": "Μονοπάτι Άρτεμις, πευκόδασος Τροόδους, χειμερινή πεζοπορία Κύπρος",
    "home.editorsPicks.items.kourion.title": "Κουρίον",
    "home.editorsPicks.items.kourion.desc": "Ρωμαϊκά ερείπια, ηλιοβασίλεμα πάνω από τη θάλασσα",
    "home.editorsPicks.items.kourion.imageAlt": "Ελληνορωμαϊκά ερείπια Κουρίου πάνω από τη Μεσόγειο, χειμώνας Κύπρος",
  },
  de: {
    "home.editorsPicks.title": "Tipps der Redaktion",
    "plan.share.copyAndShare": "Kopieren & teilen",
    "plan.share.placesCount": "{count, plural, one {# Ort} other {# Orte}}",
    "plan.share.daysCount": "{count, plural, one {# Tag} other {# Tage}}",
    "plan.share.copyLink": "Link kopieren",
    "plan.share.linkCopied": "Link kopiert",
    "plan.share.copyItinerary": "Reiseplan kopieren (Text)",
    "plan.share.copied": "Kopiert",
    "plan.share.shareTextPrefix": "Mein Zypern-Winter-Reiseplan —",
    "common.placeTypes.beach": "Strand",
    "common.placeTypes.ancientSite": "Antike Stätte",
    "common.placeTypes.village": "Dorf",
    "common.placeTypes.monastery": "Kloster",
    "common.placeTypes.winery": "Weingut",
    "common.placeTypes.restaurant": "Restaurant",
    "common.placeTypes.trail": "Wanderweg",
    "common.placeTypes.event": "Veranstaltung",
    "home.rightNow.card.defaultTease": "Im Winter einen Besuch wert.",
    "airport.page.footer.askAi": "KI fragen",
    "airport.page.footer.askAiAria": "KI zu Ankunft und Transport fragen",
    "airport.page.aria.actions": "Flughafen-Seitenaktionen",
  },
  pl: {
    "home.editorsPicks.title": "Wybór redakcji",
    "plan.share.copyAndShare": "Kopiuj i udostępnij",
    "plan.share.placesLabel": "miejsc",
    "plan.share.daysLabel": "dni",
    "plan.share.placesCount": "{count, plural, one {# miejsce} few {# miejsca} many {# miejsc} other {# miejsc}}",
    "plan.share.daysCount": "{count, plural, one {# dzień} few {# dni} many {# dni} other {# dni}}",
    "plan.share.copyLink": "Kopiuj link",
    "plan.share.linkCopied": "Link skopiowany",
    "plan.share.copyItinerary": "Kopiuj plan (tekst)",
    "plan.share.copied": "Skopiowano",
    "plan.share.shareTextPrefix": "Mój zimowy plan na Cyprze —",
    "common.placeTypes.beach": "Plaża",
    "common.placeTypes.ancientSite": "Stanowisko archeologiczne",
    "common.placeTypes.village": "Wioska",
    "common.placeTypes.monastery": "Klasztor",
    "common.placeTypes.winery": "Winnica",
    "common.placeTypes.restaurant": "Restauracja",
    "common.placeTypes.trail": "Szlak",
    "common.placeTypes.event": "Wydarzenie",
    "home.rightNow.card.defaultTease": "Warte odwiedzenia zimą.",
    "airport.page.footer.askAi": "Zapytaj AI",
    "airport.page.footer.askAiAria": "Zapytaj AI o przylot i transport",
    "airport.page.aria.actions": "Akcje strony lotniska",
  },
};

const MERGE_PATHS = [
  ["home", "editorsPicks"],
  ["home", "featuredWineries"],
  ["home", "insiderTips"],
  ["plan", "share"],
  ["common", "placeTypes"],
  ["home", "rightNow", "card"],
  ["airport", "page", "footer"],
  ["airport", "page", "aria"],
];

for (const locale of ["el", "de", "pl"]) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const parts of MERGE_PATHS) {
    let src = en;
    let tgt = data;
    for (const p of parts) src = src?.[p];
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!(p in tgt) || typeof tgt[p] !== "object") tgt[p] = {};
      tgt = tgt[p];
    }
    const leaf = parts[parts.length - 1];
    if (src && typeof src === "object") {
      if (!(leaf in tgt) || typeof tgt[leaf] !== "object") tgt[leaf] = {};
      deepMergeMissing(tgt[leaf], src);
    }
  }
  for (const [key, value] of Object.entries(OVERRIDES[locale] ?? {})) {
    setNested(data, key, value);
  }
  // Fix editorsPicks string → object conflict in legacy locales
  if (typeof data.home?.editorsPicks === "string") {
    const title = data.home.editorsPicks;
    data.home.editorsPicks = { title };
    deepMergeMissing(data.home.editorsPicks, en.home.editorsPicks);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Patched ${locale}.json`);
}

console.log("Done. Run npm run i18n:validate");
