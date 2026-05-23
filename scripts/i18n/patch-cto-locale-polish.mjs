/**
 * Native polish for keys added in visual QA (May 2026). Run: node scripts/i18n/patch-cto-locale-polish.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

/** @type {Record<string, Record<string, string>>} */
const PATCHES = {
  el: {
    "home.discoverCurated":
      "Αναρωτιέστε τι θα επιλέγαμε εμείς; Επιμελημένα για τον χειμώνα—προσθέστε στο πρόγραμμά σας καθώς περιηγείστε.",
    "home.placeOfDay.kicker": "Η επιλογή της ημέρας — ένα μέρος που αξίζει το ταξίδι",
    "home.placeOfDay.addToPlan": "Προσθήκη στο πρόγραμμα",
    "home.placeOfDay.seeDetails": "Λεπτομέρειες →",
    "home.placeOfDay.openAria": "Άνοιγμα {name}",
    "home.placeOfDay.overlays.goodDay": "Καλή μέρα για επίσκεψη",
    "home.placeOfDay.overlays.quietWeek": "Ήσυχα αυτή την εβδομάδα",
    "home.placeOfDay.overlays.clearToday": "Καθαρά σήμερα",
    "home.placeOfDay.overlays.bestAfternoon": "Καλύτερο φως το απόγευμα",
    "home.placeOfDay.overlays.worthVisit": "Αξίζει την επίσκεψη",
    "home.planningSection.srHeading": "Σχεδιασμός και βασικά",
    "home.planningSection.planTitle": "Σχεδιάστε το ταξίδι σας",
    "home.planningSection.eventsTitle": "Χειμερινές εκδηλώσεις",
    "home.planningSection.eventsDesc": "Θεοφάνεια, καρναβάλι, γευσιγνωσίες. Τι γίνεται πότε.",
    "home.planningSection.defaultSubtitle":
      "Πρότυπα, χάρτης και κοινοποίηση σε ένα μέρος—συνεχίστε στη σελίδα Πρόγραμμα.",
    "home.recentlyViewed.title": "Πρόσφατα προβολή",
    "home.recentlyViewed.clear": "Καθαρισμός",
    "events.page.footer.hubBody":
      "Προσθέστε εκδηλώσεις στο πρόγραμμά σας—ή ρωτήστε το AI τι γίνεται όταν επισκέπτεστε.",
    "events.page.footer.weatherLink": "Καιρός ανά μήνα",
    "events.page.highlights.title": "Μην χάσετε",
    "events.page.highlights.lead":
      "Η Θεοφάνεια και το καρναβάλι είναι όταν το νησί δείχνει την ψυχή του. Φτάστε νωρίς. Ντυθείτε ζεστά.",
    "events.page.tips.title": "Συμβουλές σχεδιασμού",
    "events.page.tips.item1":
      "Ελέγξτε επίσημες ιστοσελίδες για ακριβείς ημερομηνίες—πολλές εκδηλώσεις αλλάζουν κάθε χρόνο.",
    "events.page.tips.item2": "Κλείστε νωρίς για Θεοφάνεια, καρναβάλι και χριστουγεννιάτικες αγορές.",
    "events.page.tips.item3": "Φτάστε νωρίς σε δημοφιλείς εκδηλώσεις. Τα καλύτερα σημεία γεμίζουν γρήγορα.",
    "events.page.tips.item4":
      "Συνδυάστε εκδηλώσεις με κοντινά μονοπάτια ή χωριά. Πεζοπορία το πρωί, εκδήλωση το απόγευμα.",
    "regions.page.footer.hubBody":
      "Εξερευνήστε μονοπάτια, χωριά και οινοποιεία στην περιοχή—και προσθέστε τα στο πρόγραμμά σας.",
    "regions.page.footer.weatherLink": "Καιρός ανά μήνα",
    "wineRoutes.page.footer.hubBody":
      "Κλείστε γευσιγνωσίες εκ των προτέρων και συνδυάστε τη διαδρομή με χωριό ή μονοπάτι κοντά.",
    "wineRoutes.page.footer.allWineries": "Όλα τα οινοποιεία της Κύπρου",
    "search.footer.hubBody":
      "Προσθέστε μέρη στο πρόγραμμά σας—ή ρωτήστε το AI. Γνωρίζει το νησί τον χειμώνα.",
  },
  de: {
    "home.discoverCurated":
      "Neugierig, was wir wählen würden? Kuratiert für den Winter—fügen Sie beim Stöbern zu Ihrem Plan hinzu.",
    "home.placeOfDay.kicker": "Tipp des Tages — ein Ort, der die Fahrt wert ist",
    "home.placeOfDay.addToPlan": "Zum Plan hinzufügen",
    "home.placeOfDay.seeDetails": "Details →",
    "home.placeOfDay.openAria": "{name} öffnen",
    "home.placeOfDay.overlays.goodDay": "Guter Tag dafür",
    "home.placeOfDay.overlays.quietWeek": "Ruhig diese Woche",
    "home.placeOfDay.overlays.clearToday": "Heute klar",
    "home.placeOfDay.overlays.bestAfternoon": "Bestes Licht am Nachmittag",
    "home.placeOfDay.overlays.worthVisit": "Besuch lohnt sich",
    "home.planningSection.srHeading": "Planung und Essentials",
    "home.planningSection.planTitle": "Reise planen",
    "home.planningSection.eventsTitle": "Winter-Events",
    "home.planningSection.eventsDesc": "Epiphanias, Karneval, Verkostungen. Was wann stattfindet.",
    "home.planningSection.defaultSubtitle":
      "Vorlagen, Karte und Teilen an einem Ort—weiter auf der Plan-Seite.",
    "home.recentlyViewed.title": "Zuletzt angesehen",
    "home.recentlyViewed.clear": "Löschen",
    "events.page.footer.hubBody":
      "Events zum Plan hinzufügen—oder die KI fragen, was während Ihres Besuchs läuft.",
    "events.page.footer.weatherLink": "Wetter nach Monat",
    "events.page.highlights.title": "Nicht verpassen",
    "events.page.highlights.lead":
      "Epiphanias und Karneval zeigen die Seele der Insel. Kommen Sie früh. Warm anziehen.",
    "events.page.tips.title": "Planungstipps",
    "events.page.tips.item1":
      "Offizielle Seiten für genaue Termine prüfen—viele Events wechseln von Jahr zu Jahr.",
    "events.page.tips.item2": "Früh buchen für Epiphanias, Karneval und Weihnachtsmärkte.",
    "events.page.tips.item3": "Bei beliebten Events früh da sein. Die besten Plätze sind schnell weg.",
    "events.page.tips.item4":
      "Events mit nahen Trails oder Dörfern verbinden. Vormittags wandern, nachmittags Event.",
    "regions.page.footer.hubBody":
      "Trails, Dörfer und Weingüter in der Region entdecken—dann zum Plan hinzufügen.",
    "regions.page.footer.weatherLink": "Wetter nach Monat",
    "wineRoutes.page.footer.hubBody":
      "Verkostungen vorab buchen und die Route mit einem Dorf oder Trail in der Nähe verbinden.",
    "wineRoutes.page.footer.allWineries": "Alle Weingüter Zyperns",
    "search.footer.hubBody":
      "Orte zum Plan hinzufügen—oder die KI fragen. Sie kennt die Insel im Winter.",
  },
  pl: {
    "home.discoverCurated":
      "Ciekawi, co byśmy wybrali? Kuracja na zimę—dodawaj do planu podczas przeglądania.",
    "home.placeOfDay.kicker": "Wybór dnia — miejsce warte przejazdu",
    "home.placeOfDay.addToPlan": "Dodaj do planu",
    "home.placeOfDay.seeDetails": "Szczegóły →",
    "home.placeOfDay.openAria": "Otwórz {name}",
    "home.placeOfDay.overlays.goodDay": "Dobry dzień na wizytę",
    "home.placeOfDay.overlays.quietWeek": "Cicho w tym tygodniu",
    "home.placeOfDay.overlays.clearToday": "Dziś bez przeszkód",
    "home.placeOfDay.overlays.bestAfternoon": "Najlepsze światło po południu",
    "home.placeOfDay.overlays.worthVisit": "Warte odwiedzin",
    "home.planningSection.srHeading": "Planowanie i podstawy",
    "home.planningSection.planTitle": "Zaplanuj podróż",
    "home.planningSection.eventsTitle": "Zimowe wydarzenia",
    "home.planningSection.eventsDesc": "Epifania, karnawał, degustacje. Co jest kiedy.",
    "home.planningSection.defaultSubtitle":
      "Szablony, mapa i udostępnianie w jednym miejscu—kontynuuj na stronie Planu.",
    "home.recentlyViewed.title": "Ostatnio oglądane",
    "home.recentlyViewed.clear": "Wyczyść",
    "events.page.footer.hubBody":
      "Dodaj wydarzenia do planu—lub zapytaj AI, co jest w trakcie wizyty.",
    "events.page.footer.weatherLink": "Pogoda wg miesiąca",
    "events.page.highlights.title": "Nie przegap",
    "events.page.highlights.lead":
      "Epifania i karnawał to dusza wyspy. Przyjedź wcześnie. Ubierz się ciepło.",
    "events.page.tips.title": "Wskazówki planowania",
    "events.page.tips.item1":
      "Sprawdź oficjalne strony co do dat—wiele wydarzeń zmienia terminy co roku.",
    "events.page.tips.item2": "Rezerwuj wcześniej na Epifanię, karnawał i jarmarki świąteczne.",
    "events.page.tips.item3": "Na popularnych wydarzeniach przyjedź wcześnie. Najlepsze miejsca znikają szybko.",
    "events.page.tips.item4":
      "Łącz wydarzenia z pobliskimi szlakami lub wioskami. Rano trekking, po południu wydarzenie.",
    "regions.page.footer.hubBody":
      "Odkryj szlaki, wioski i winnice w regionie—i dodaj wybrane do planu.",
    "regions.page.footer.weatherLink": "Pogoda wg miesiąca",
    "wineRoutes.page.footer.hubBody":
      "Zarezerwuj degustacje z wyprzedzeniem i połącz trasę z pobliską wioską lub szlakiem.",
    "wineRoutes.page.footer.allWineries": "Wszystkie winnice Cypru",
    "search.footer.hubBody":
      "Dodaj miejsca do planu—lub zapytaj AI. Zna wyspę zimą.",
  },
};

function setNested(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const locale of ["el", "de", "pl"]) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(PATCHES[locale])) {
    setNested(data, key, value);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`patched ${locale}.json`);
}
