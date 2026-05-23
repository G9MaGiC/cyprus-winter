/**
 * i18n keys for CTO scan fixes (booking, airport, discover, cookies). Run after en.json update.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

/** @type {Record<string, Record<string, string>>} */
const PATCHES = {
  el: {
    "common.cookies.essentialOnly": "Μόνο απαραίτητα",
    "common.cookies.essentialShort": "Απαραίτητα",
    "airport.page.quickActions.aria": "Γρήγορες ενέργειες άφιξης",
    "airport.page.quickActions.kicker": "Φτάστε πιο γρήγορα",
    "discover.detail.whyNow.title": "Γιατί τώρα",
    "discover.detail.whyNow.bestFor": "Ιδανικό για {types}.",
    "discover.detail.whyNow.regionFlow": "Η {region} είναι πρακτική στάση για το ίδιο πρόγραμμα ημέρας.",
    "discover.detail.whyNow.saveCompare":
      "Αποθηκεύστε τώρα για σύγκριση με παρόμοιες επιλογές αργότερα χωρίς να χάσετε το πλαίσιο.",
    "discover.detail.trustTiming.title": "Εμπιστοσύνη και χρόνος",
    "discover.detail.trustTiming.body":
      "Επαληθευμένα στοιχεία συνεργατών με πρακτική διαθεσιμότητα. Κρατήστε το μέρος στο πρόγραμμά σας πρώτα, μετά επιβεβαιώστε.",
    "book.form.trust.aria": "Πληροφορίες εμπιστοσύνης κράτησης",
    "book.form.trust.heading": "Πριν υποβάλετε",
    "book.form.trust.verifiedRoute": "Διαδρομή αιτήματος επαληθευμένου {context}.",
    "book.form.trust.emailConfirm": "Η επιβεβαίωση συνήθως έρχεται με email εντός 24 ωρών.",
    "book.form.trust.noCharge": "Χωρίς άμεση χρέωση στην εφαρμογή· οι πάροχοι επιβεβαιώνουν πρώτα τη διαθεσιμότητα.",
    "book.form.trust.contextPartner": "συνεργάτη",
    "book.form.trust.contextGuide": "οδηγού",
    "book.form.progress.aria": "Πρόοδος κράτησης",
    "book.form.progress.stepDetails": "Στοιχεία",
    "book.form.progress.stepSent": "Αίτημα στάλθηκε",
    "book.form.progress.stepConfirmation": "Επιβεβαίωση",
    "book.form.states.heading": "Καταστάσεις κράτησης:",
    "book.form.states.wineryBody": "Αίτημα τώρα — επιβεβαίωση μετά την απάντηση του συνεργάτη.",
    "book.form.states.guideBody": "Αίτημα τώρα — επιβεβαίωση μετά την απάντηση του οδηγού.",
    "book.form.states.offlineQueue":
      "Εκτός σύνδεσης, το αίτημά σας μπαίνει σε ουρά συγχρονισμού και επαναλαμβάνεται αυτόματα.",
  },
  de: {
    "common.cookies.essentialOnly": "Nur essenziell",
    "common.cookies.essentialShort": "Essenziell",
    "airport.page.quickActions.aria": "Schnellaktionen bei Ankunft",
    "airport.page.quickActions.kicker": "Schneller ankommen",
    "discover.detail.whyNow.title": "Warum jetzt",
    "discover.detail.whyNow.bestFor": "Ideal für {types}.",
    "discover.detail.whyNow.regionFlow": "{region} ist ein praktischer Stopp für denselben Tagesplan.",
    "discover.detail.whyNow.saveCompare":
      "Jetzt speichern, um später ähnliche Optionen zu vergleichen, ohne den Kontext zu verlieren.",
    "discover.detail.trustTiming.title": "Vertrauen und Timing",
    "discover.detail.trustTiming.body":
      "Verifizierte Partnerdetails mit praktischer Verfügbarkeit. Erst in den Plan, dann bestätigen.",
    "book.form.trust.aria": "Vertrauensinformationen zur Buchung",
    "book.form.trust.heading": "Vor dem Absenden",
    "book.form.trust.verifiedRoute": "Verifizierte {context}-Anfrageroute.",
    "book.form.trust.emailConfirm": "Bestätigung meist per E-Mail innerhalb von 24 Stunden.",
    "book.form.trust.noCharge": "Keine Sofortzahlung in der App; Anbieter bestätigen zuerst die Verfügbarkeit.",
    "book.form.trust.contextPartner": "Partner",
    "book.form.trust.contextGuide": "Guide",
    "book.form.progress.aria": "Buchungsfortschritt",
    "book.form.progress.stepDetails": "Details",
    "book.form.progress.stepSent": "Anfrage gesendet",
    "book.form.progress.stepConfirmation": "Bestätigung",
    "book.form.states.heading": "Buchungsstatus:",
    "book.form.states.wineryBody": "Jetzt angefragt — nach Partnerantwort bestätigt.",
    "book.form.states.guideBody": "Jetzt angefragt — nach Guide-Antwort bestätigt.",
    "book.form.states.offlineQueue":
      "Offline wird Ihre Anfrage in die Sync-Warteschlange gestellt und automatisch wiederholt.",
  },
  pl: {
    "common.cookies.essentialOnly": "Tylko niezbędne",
    "common.cookies.essentialShort": "Niezbędne",
    "airport.page.quickActions.aria": "Szybkie działania po przylocie",
    "airport.page.quickActions.kicker": "Szybciej na miejscu",
    "discover.detail.whyNow.title": "Dlaczego teraz",
    "discover.detail.whyNow.bestFor": "Najlepsze dla {types}.",
    "discover.detail.whyNow.regionFlow": "{region} to praktyczny przystanek w tym samym planie dnia.",
    "discover.detail.whyNow.saveCompare":
      "Zapisz teraz, by później porównać podobne opcje bez utraty kontekstu.",
    "discover.detail.trustTiming.title": "Zaufanie i czas",
    "discover.detail.trustTiming.body":
      "Zweryfikowane dane partnera i praktyczna dostępność. Najpierw dodaj do planu, potem potwierdź.",
    "book.form.trust.aria": "Informacje o zaufaniu rezerwacji",
    "book.form.trust.heading": "Przed wysłaniem",
    "book.form.trust.verifiedRoute": "Zweryfikowana trasa zapytania {context}.",
    "book.form.trust.emailConfirm": "Potwierdzenie zwykle e-mailem w ciągu 24 godzin.",
    "book.form.trust.noCharge": "Bez natychmiastowej opłaty w aplikacji; dostawcy najpierw potwierdzają dostępność.",
    "book.form.trust.contextPartner": "partnera",
    "book.form.trust.contextGuide": "przewodnika",
    "book.form.progress.aria": "Postęp rezerwacji",
    "book.form.progress.stepDetails": "Szczegóły",
    "book.form.progress.stepSent": "Wysłano zapytanie",
    "book.form.progress.stepConfirmation": "Potwierdzenie",
    "book.form.states.heading": "Statusy rezerwacji:",
    "book.form.states.wineryBody": "Zapytanie teraz — potwierdzenie po odpowiedzi partnera.",
    "book.form.states.guideBody": "Zapytanie teraz — potwierdzenie po odpowiedzi przewodnika.",
    "book.form.states.offlineQueue":
      "Offline zapytanie trafia do kolejki synchronizacji i jest ponawiane automatycznie.",
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
