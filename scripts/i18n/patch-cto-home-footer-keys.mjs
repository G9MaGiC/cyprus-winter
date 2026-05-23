/**
 * Home footer i18n keys (May 2026 CTO pass). Run: node scripts/i18n/patch-cto-home-footer-keys.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

/** @type {Record<string, Record<string, string>>} */
const PATCHES = {
  el: {
    "home.insiderTip.heading": "Συμβουλή χειμερινού insider",
    "home.insiderTip.cta.hiking": "Έλεγχος συνθηκών μονοπατιών",
    "home.insiderTip.cta.practical": "Συμβουλές αεροδρομίου",
    "home.insiderTip.cta.default": "Εξερεύνηση τοποθεσιών",
    "home.templates.kicker": "Έτοιμα προγράμματα",
    "home.templates.subtitle": "Επιμελημένα από ειδικούς. Ρεαλιστικός ρυθμός. Ξεκινήστε εδώ, μετά προσαρμόστε.",
    "home.templates.allTemplates": "Όλα τα πρότυπα →",
    "home.templates.items.short-stay.label": "48 ώρες",
    "home.templates.items.short-stay.hint": "Μονοπάτι, χωριό, κρασί",
    "home.templates.items.classic.label": "5 ημέρες",
    "home.templates.items.classic.hint": "Ακτή έως βουνά",
    "home.templates.items.classic-7.label": "7 ημέρες",
    "home.templates.items.classic-7.hint": "Πλήρης περιήγηση νησιού",
    "home.templates.items.mountain-10.label": "10 ημέρες",
    "home.templates.items.mountain-10.hint": "Πεζοπορία σε βάθος",
    "home.whyCyprus.title": "Γιατί Κύπρος τον χειμώνα",
    "home.whyCyprus.coastTemp": "Ακτή συχνά 16–20°C",
    "home.whyCyprus.troodosCooler": "Τρόοδος πιο δροσερά — ελέγξτε συνθήκες",
    "home.whyCyprus.sunset": "Ηλιοβασίλεμα ~17:00 τον Δεκέμβριο",
    "home.whyCyprus.blockquote":
      "Ήπια ακτή. Βουνά με χιόνι. Πεζοπορία το πρωί, γεύμα έξω. Αρχαία άδεια, χωριά ήσυχα. Σταματήστε σε καφενείο. Καφές. Κανείς δεν βιάζεται.",
    "home.whyCyprus.rule":
      "Μικρός κανόνας: ένα μονοπάτι, ένα χωριό, μία γευσιγνωσία. Προσθέστε στο πρόγραμμα καθώς πηγαίνετε.",
    "home.whyCyprus.tagline": "Ήρθατε για τη ζεστασιά. Μείνετε για τον ρυθμό.",
    "home.whyCyprusTeaser.quote":
      "Πεζοπορία το πρωί, γεύμα έξω. Αρχαία άδεια, χωριά ήσυχα. Κανείς δεν βιάζεται.",
    "home.editorsPicksOpenAria": "Άνοιγμα {title}",
  },
  de: {
    "home.insiderTip.heading": "Winter-Insider-Tipp",
    "home.insiderTip.cta.hiking": "Trail-Bedingungen prüfen",
    "home.insiderTip.cta.practical": "Flughafen-Tipps",
    "home.insiderTip.cta.default": "Orte entdecken",
    "home.templates.kicker": "Fertige Reiserouten",
    "home.templates.subtitle": "Kuratiert von Experten. Realistisches Tempo. Hier starten, dann anpassen.",
    "home.templates.allTemplates": "Alle Vorlagen →",
    "home.templates.items.short-stay.label": "48 Stunden",
    "home.templates.items.short-stay.hint": "Trail, Dorf, Wein",
    "home.templates.items.classic.label": "5 Tage",
    "home.templates.items.classic.hint": "Küste bis Berge",
    "home.templates.items.classic-7.label": "7 Tage",
    "home.templates.items.classic-7.hint": "Ganze Insel",
    "home.templates.items.mountain-10.label": "10 Tage",
    "home.templates.items.mountain-10.hint": "Wander-Fokus",
    "home.whyCyprus.title": "Warum Zypern im Winter",
    "home.whyCyprus.coastTemp": "Küste oft 16–20°C",
    "home.whyCyprus.troodosCooler": "Troodos kühler — Bedingungen prüfen",
    "home.whyCyprus.sunset": "Sonnenuntergang ~17 Uhr im Dezember",
    "home.whyCyprus.blockquote":
      "Milde Küste. Berge mit Schnee. Morgens wandern, mittags draußen essen. Antike Stätten leer, Dörfer ruhig. Pause im Kafenion. Kaffee. Niemand hetzt.",
    "home.whyCyprus.rule":
      "Kleine Regel: ein Trail, ein Dorf, eine Verkostung. Unterwegs zum Plan hinzufügen.",
    "home.whyCyprus.tagline": "Sie kamen wegen der Wärme. Bleiben Sie wegen des Tempos.",
    "home.whyCyprusTeaser.quote":
      "Morgens wandern, mittags draußen essen. Antike Stätten leer, Dörfer ruhig. Niemand hetzt.",
    "home.editorsPicksOpenAria": "{title} öffnen",
  },
  pl: {
    "home.insiderTip.heading": "Zimowa wskazówka insider",
    "home.insiderTip.cta.hiking": "Sprawdź warunki na szlakach",
    "home.insiderTip.cta.practical": "Wskazówki lotniskowe",
    "home.insiderTip.cta.default": "Odkrywaj miejsca",
    "home.templates.kicker": "Gotowe plany podróży",
    "home.templates.subtitle": "Kuracja ekspertów. Realistyczne tempo. Zacznij tutaj, potem dopasuj.",
    "home.templates.allTemplates": "Wszystkie szablony →",
    "home.templates.items.short-stay.label": "48 godzin",
    "home.templates.items.short-stay.hint": "Szlak, wieś, wino",
    "home.templates.items.classic.label": "5 dni",
    "home.templates.items.classic.hint": "Od wybrzeża po góry",
    "home.templates.items.classic-7.label": "7 dni",
    "home.templates.items.classic-7.hint": "Cała wyspa",
    "home.templates.items.mountain-10.label": "10 dni",
    "home.templates.items.mountain-10.hint": "Dla piechurów",
    "home.whyCyprus.title": "Dlaczego Cypr zimą",
    "home.whyCyprus.coastTemp": "Wybrzeże często 16–20°C",
    "home.whyCyprus.troodosCooler": "Troodos chłodniej — sprawdź warunki",
    "home.whyCyprus.sunset": "Zachód słońca ~17:00 w grudniu",
    "home.whyCyprus.blockquote":
      "Łagodne wybrzeże. Góry ze śniegiem. Rano szlak, obiad na zewnątrz. Puste zabytki, ciche wioski. Postój w kafenion. Kawa. Nikt się nie spieszy.",
    "home.whyCyprus.rule":
      "Mała zasada: jeden szlak, jedna wieś, jedna degustacja. Dodawaj do planu w drodze.",
    "home.whyCyprus.tagline": "Przyjechałeś po ciepło. Zostań dla tempa.",
    "home.whyCyprusTeaser.quote":
      "Rano szlak, obiad na zewnątrz. Puste zabytki, ciche wioski. Nikt się nie spieszy.",
    "home.editorsPicksOpenAria": "Otwórz {title}",
  },
};

function setNested(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [locale, patches] of Object.entries(PATCHES)) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(patches)) {
    setNested(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Patched ${locale}.json (${Object.keys(patches).length} keys)`);
}

// Sync EN from en.json structure (keys already in en.json)
console.log("EN keys added via messages/en.json edit.");
