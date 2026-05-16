import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

/** @type {Record<string, Record<string, string>>} */
const TRANSLATIONS = {
  el: {
    "common.hubFooter.prompt":
      "Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI για ιδέες.",
    "common.hubFooter.aria.actions": "Ενέργειες σελίδας",
    "common.tripPlanSummary.aria": "Σύνοψη του προγράμματός σας",
    "common.tripPlanSummary.places":
      "{count, plural, one {# τοποθεσία στο πρόγραμμά σας} other {# τοποθεσίες στο πρόγραμμά σας}}",
    "common.tripPlanSummary.viewPlan": "Δείτε το πρόγραμμα",
    "common.skipTo.thisWeek": "Μετάβαση στο Αυτή την εβδομάδα",
    "common.skipTo.search": "Μετάβαση στην αναζήτηση",
    "common.skipTo.startHere": "Μετάβαση στο Ξεκινήστε εδώ",
    "home.tripModes.aria": "Επιλέξτε πώς ταξιδεύετε",
    "home.tripModes.arriving": "Μόλις έφτασα",
    "home.tripModes.planning": "Σχεδιάζω",
    "home.tripModes.exploring": "Εξερευνώ",
    "discover.page.viewTabs.aria": "Προβολή τοποθεσιών ως λίστα ή χάρτη",
    "discover.page.viewTabs.list": "Λίστα",
    "discover.page.viewTabs.map": "Χάρτης",
    "beaches.page.footer.hubBody":
      "Συνδυάστε έναν περίπατο στην παραλία με αρχαία ερείπια ή γεύμα σε χωριό. Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI.",
    "beaches.page.aria.actions": "Ενέργειες σελίδας παραλιών",
    "villages.page.footer.hubBody":
      "Συνδυάστε επίσκεψη σε χωριό με μονοπάτι ή οινοποιείο. Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI.",
    "villages.page.aria.actions": "Ενέργειες σελίδας χωριών",
    "wineries.page.footer.hubBody":
      "Συνδυάστε επίσκεψη σε οινοποιείο με μονοπάτι ή χωριό. Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI.",
    "wineries.page.aria.actions": "Ενέργειες σελίδας οινοποιείων",
    "secrets.page.footer.hubBody":
      "Συνδυάστε μυστικά με μονοπάτια και χωριά. Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI.",
    "secrets.page.aria.actions": "Ενέργειες σελίδας μυστικών",
    "trails.conditionsEditorial": "Χειμερινό στιγμιότυπο",
  },
  de: {
    "common.hubFooter.prompt":
      "Orte zu Ihrem Plan hinzufügen—oder die KI nach Ideen fragen.",
    "common.hubFooter.aria.actions": "Seitenaktionen",
    "common.tripPlanSummary.aria": "Zusammenfassung Ihres Reiseplans",
    "common.tripPlanSummary.places":
      "{count, plural, one {# Ort in Ihrem Plan} other {# Orte in Ihrem Plan}}",
    "common.tripPlanSummary.viewPlan": "Plan ansehen",
    "common.skipTo.thisWeek": "Zu Diese Woche springen",
    "common.skipTo.search": "Zur Suche springen",
    "common.skipTo.startHere": "Zu Start hier springen",
    "home.tripModes.aria": "Wählen Sie, wie Sie reisen",
    "home.tripModes.arriving": "Gerade angekommen",
    "home.tripModes.planning": "Planung",
    "home.tripModes.exploring": "Erkunden",
    "discover.page.viewTabs.aria": "Orte als Liste oder Karte anzeigen",
    "discover.page.viewTabs.list": "Liste",
    "discover.page.viewTabs.map": "Karte",
    "beaches.page.footer.hubBody":
      "Kombinieren Sie einen Strandspaziergang mit antiken Ruinen oder einem Dorfmittagessen. Orte zum Plan hinzufügen—oder die KI fragen.",
    "beaches.page.aria.actions": "Strandseiten-Aktionen",
    "villages.page.footer.hubBody":
      "Kombinieren Sie einen Dorfbesuch mit einer Route oder einem Weingut. Orte zum Plan hinzufügen—oder die KI fragen.",
    "villages.page.aria.actions": "Dorfseiten-Aktionen",
    "wineries.page.footer.hubBody":
      "Kombinieren Sie einen Weingutbesuch mit einer Route oder einem Dorf. Orte zum Plan hinzufügen—oder die KI fragen.",
    "wineries.page.aria.actions": "Weingutseiten-Aktionen",
    "secrets.page.footer.hubBody":
      "Kombinieren Sie Geheimtipps mit Routen und Dörfern. Orte zum Plan hinzufügen—oder die KI fragen.",
    "secrets.page.aria.actions": "Geheimtipps-Seitenaktionen",
    "trails.conditionsEditorial": "Winter-Schnappschuss",
  },
  pl: {
    "common.hubFooter.prompt":
      "Dodaj miejsca do planu—lub zapytaj AI o pomysły.",
    "common.hubFooter.aria.actions": "Akcje strony",
    "common.tripPlanSummary.aria": "Podsumowanie planu podróży",
    "common.tripPlanSummary.places":
      "{count, plural, one {# miejsce w planie} few {# miejsca w planie} many {# miejsc w planie} other {# miejsca w planie}}",
    "common.tripPlanSummary.viewPlan": "Zobacz plan",
    "common.skipTo.thisWeek": "Przejdź do Ten tydzień",
    "common.skipTo.search": "Przejdź do wyszukiwania",
    "common.skipTo.startHere": "Przejdź do Zacznij tutaj",
    "home.tripModes.aria": "Wybierz, jak podróżujesz",
    "home.tripModes.arriving": "Właśnie przyjechałem",
    "home.tripModes.planning": "Planowanie",
    "home.tripModes.exploring": "Odkrywanie",
    "discover.page.viewTabs.aria": "Wyświetl miejsca jako listę lub mapę",
    "discover.page.viewTabs.list": "Lista",
    "discover.page.viewTabs.map": "Mapa",
    "beaches.page.footer.hubBody":
      "Połącz spacer po plaży z ruinami lub lunchem w wiosce. Dodaj miejsca do planu—lub zapytaj AI.",
    "beaches.page.aria.actions": "Akcje strony plaż",
    "villages.page.footer.hubBody":
      "Połącz wizytę w wiosce ze szlakiem lub winnicą. Dodaj miejsca do planu—lub zapytaj AI.",
    "villages.page.aria.actions": "Akcje strony wiosek",
    "wineries.page.footer.hubBody":
      "Połącz wizytę w winnicy ze szlakiem lub wioską. Dodaj miejsca do planu—lub zapytaj AI.",
    "wineries.page.aria.actions": "Akcje strony winnic",
    "secrets.page.footer.hubBody":
      "Połącz sekrety ze szlakami i wioskami. Dodaj miejsca do planu—lub zapytaj AI.",
    "secrets.page.aria.actions": "Akcje strony sekretów",
    "trails.conditionsEditorial": "Zimowy obraz",
  },
};

function setByPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const locale of ["el", "de", "pl"]) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(TRANSLATIONS[locale])) {
    setByPath(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Patched ${locale}.json (${Object.keys(TRANSLATIONS[locale]).length} keys)`);
}
