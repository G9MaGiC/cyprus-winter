import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");

/** @type {Record<string, Record<string, string>>} */
const TRANSLATIONS = {
  el: {
    "home.startHere.chip.boulderingPlus": "Bouldering+",
    "home.startHere.chip.boulderingPlusAria": "Μπούλντερινγκ και τοίχοι αναρρίχησης στην Κύπρο",
    "home.startHere.chip.climbing": "Αναρρίχηση",
    "home.startHere.chip.climbingAria": "Αναρρίχηση σε βράχους και πέτρινους τοίχους",
    "home.startHere.chip.cycling": "Ποδηλασία",
    "home.startHere.chip.cyclingAria": "Διαδρομές ποδηλασίας και μονοπάτια για ποδήλατο",
    "home.startHere.chip.watersports": "Θαλάσσια σπορ",
    "home.startHere.chip.watersportsAria": "Θαλάσσια σπορ — κατάδυση, καγιάκ, παράκτια",
    "account.settings.interests.labels.bouldering": "Bouldering+",
    "account.settings.interests.labels.climbing": "Αναρρίχηση σε βράχους",
    "account.settings.interests.labels.cycling": "Ποδηλασία",
  },
  de: {
    "home.startHere.chip.boulderingPlus": "Bouldering+",
    "home.startHere.chip.boulderingPlusAria": "Bouldern und Kletterhallen auf Zypern",
    "home.startHere.chip.climbing": "Klettern",
    "home.startHere.chip.climbingAria": "Felsklettern und Klettergebiete auf Zypern",
    "home.startHere.chip.cycling": "Radfahren",
    "home.startHere.chip.cyclingAria": "Radwege und fahrradfreundliche Strecken",
    "home.startHere.chip.watersports": "Wassersport",
    "home.startHere.chip.watersportsAria": "Wassersport — Tauchen, Kajak, Küstenabenteuer",
    "account.settings.interests.labels.bouldering": "Bouldering+",
    "account.settings.interests.labels.climbing": "Felsklettern",
    "account.settings.interests.labels.cycling": "Radfahren",
  },
  pl: {
    "home.startHere.chip.boulderingPlus": "Bouldering+",
    "home.startHere.chip.boulderingPlusAria": "Bouldering i ścianki wspinaczkowe na Cyprze",
    "home.startHere.chip.climbing": "Wspinaczka",
    "home.startHere.chip.climbingAria": "Wspinaczka skałkowa i rejony na Cyprze",
    "home.startHere.chip.cycling": "Kolarstwo",
    "home.startHere.chip.cyclingAria": "Trasy rowerowe i szlaki przyjazne rowerom",
    "home.startHere.chip.watersports": "Sporty wodne",
    "home.startHere.chip.watersportsAria": "Sporty wodne — nurkowanie, kajaki, przybrzeżne",
    "account.settings.interests.labels.bouldering": "Bouldering+",
    "account.settings.interests.labels.climbing": "Wspinaczka skałkowa",
    "account.settings.interests.labels.cycling": "Kolarstwo",
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
