import type { CyclingRoute } from "@/lib/cycling-route-types";

/** Curated Visit Cyprus cycling routes — winter-relevant subset (official CTO pages). */
export const cyclingRoutes: CyclingRoute[] = [
  {
    id: "athalassa-forest-park",
    name: "Athalassa National Forest Park",
    region: "lefkosia",
    distanceKm: 16,
    bikeType: "any",
    surface: "paved",
    difficulty: "easy",
    description:
      "Sixteen kilometres of paved path in Nicosia's green belt. Locals ride it year-round; winter rain keeps the pines fresh and the car park quiet on weekdays.",
    winterNote: "Capital's easiest winter loop when Troodos is snowed in.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/athalassa-national-forest-park-cycling-route/",
    relatedPlaceId: "athalassa-forest-park",
    winterPick: true,
  },
  {
    id: "cy-rc06-divine-coast",
    name: "Divine Coast",
    region: "lemesos",
    distanceKm: 131.2,
    elevationGainM: 1191,
    isLoop: true,
    bikeType: "road",
    surface: "paved",
    difficulty: "demanding",
    description:
      "Governor's Beach to Pissouri Bay and back along the Limassol coast — Kourion theatre, marina, and long flat miles between climbs.",
    winterNote: "Mild coastal winter; start early for daylight on the full loop.",
    visitCyprusUrl: "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc06-divine-coast/",
    gpxUrl: "https://www.visitcyprus.com/wp-content/uploads/2024/09/CY_RC06_Divine_Coast.gpx",
    winterPick: true,
  },
  {
    id: "cy-rc04-heart-of-koumandaria",
    name: "The Heart of Koumandaria",
    region: "lemesos",
    distanceKm: 97.2,
    isLoop: true,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Commandaria wine villages and rolling Krasochoria roads. Stone-built hamlets, vine terraces, and monastery stops between Limassol hills.",
    winterNote: "Bare vines and golden light — one of the best winter road rides on the island.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc04-the-heart-of-koumandaria/",
    relatedPlaceId: "krasochoria-gravel-loop",
    winterPick: true,
  },
  {
    id: "cy-rc15-sea-of-green-coast",
    name: "A Sea of Green and the Coast",
    region: "larnaka",
    distanceKm: 83.8,
    isLoop: true,
    bikeType: "road",
    surface: "paved",
    difficulty: "moderate",
    description:
      "Tochni, Choirokoitia UNESCO site, Vavla, and the Limassol foothills — village lanes and orange-valley climbs without Troodos severity.",
    winterNote: "Empty weekday roads; combine with a Zygi fish lunch.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc15-a-sea-of-green-and-the-coast/",
    relatedPlaceId: "larnaca-village-coastal-cycle",
    winterPick: true,
  },
  {
    id: "cy-rc19-kornos-lefkara",
    name: "From the Kornos Mountains to the Lefkara Hills",
    region: "larnaka",
    distanceKm: 65.7,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Lace villages and mountain views above Larnaca. Lefkara silver and Lefkara lace; cooler air than the coast in January.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc19-from-the-kornos-mountains-to-the-lefkara-hills/",
    winterPick: true,
  },
  {
    id: "pafos-1-castle-loop",
    name: "Pafos Castle & Ezousa Valley",
    region: "pafos",
    distanceKm: null,
    isLoop: true,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Orange groves, Episkopi rock church, and Ezousa Valley views. Climb to Troodos views; mostly downhill return to Pafos harbour.",
    winterNote: "Coast stays mild; valley climb can be cool — layer for the top.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/pafos-1-pafos-castle-agia-varvara-episkopi-tsada-armou-agia-varvara-pafos-castle-cycling-route/",
    gpxUrl: "https://www.visitcyprus.com/wp-content/uploads/2024/09/Pafos_1_GPX.gpx",
    winterPick: true,
  },
  {
    id: "pafos-3-akamas-lara",
    name: "Pafos to Lara & Baths of Aphrodite",
    region: "pafos",
    distanceKm: 37,
    bikeType: "any",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Akamas edge: Agios Georgios, Lara Bay, Fontana Amorosa, and the Baths of Aphrodite. Gravel and tarmac; spectacular winter coast.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/pafos-3-pafos-paphos-ag-georgios-lara-fontana-amorosa-baths-of-aphrodite-cycling-route/",
    relatedPlaceId: "akamas-latchi-cycling",
    winterPick: true,
  },
  {
    id: "polis-argaka-loop",
    name: "Polis to Argaka",
    region: "pafos",
    distanceKm: null,
    isLoop: true,
    bikeType: "road",
    surface: "paved",
    difficulty: "moderate",
    description:
      "Chrysochou Bay coast road through Polis harbour and Argaka village. Quiet winter miles on the island's north-west shore.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/polis-argaka-cycling-route/",
  },
  {
    id: "main-11-troodos-pafos",
    name: "Troodos to Pafos",
    region: "troodos",
    distanceKm: 68.6,
    bikeType: "road",
    surface: "paved",
    difficulty: "demanding",
    description:
      "Mountain descent from Troodos toward Pafos — pine forest, switchbacks, and long downhill to the coast when conditions allow.",
    winterNote: "Check snow/ice on Troodos summit roads before committing.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/main-11-troodos-pafos-paphos-cycling-route/",
    relatedPlaceId: "troodos-cycling-hub",
    winterPick: true,
  },
  {
    id: "main-3-solea-valley",
    name: "Lefkosia to Solea Valley",
    region: "troodos",
    distanceKm: 156.4,
    bikeType: "road",
    surface: "paved",
    difficulty: "demanding",
    description:
      "Capital to Solea Valley and Troodos foothills. Long day ride through Kakopetria, pine forest, and mountain villages.",
    winterNote: "Full daylight required; upper Solea can be cold and occasionally icy.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/main-3-lefkosia-nicosia-solea-valley-cycling-route/",
  },
  {
    id: "lemesos-1-amathous",
    name: "Limassol to Ancient Amathus",
    region: "lemesos",
    distanceKm: 9.9,
    isLoop: true,
    bikeType: "any",
    surface: "paved",
    difficulty: "easy",
    description:
      "Short coastal loop from Limassol to the Amathus archaeological site. Flat, paved, ideal for a winter morning spin.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/lemesos-limassol-ancient-amathous-cycling-route/",
    relatedPlaceId: "limassol-coastal-cycle",
  },
  {
    id: "lemesos-3-fasouri-pachna",
    name: "Limassol – Fasouri – Pachna Loop",
    region: "lemesos",
    distanceKm: null,
    isLoop: true,
    bikeType: "road",
    surface: "paved",
    difficulty: "moderate",
    description:
      "Circular ride through Limassol suburbs into vine country at Pachna. Rolling hills; quieter than summer.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/lemesos-limassol-circular-cycling-route/",
  },
  {
    id: "agia-napa-xylofagou",
    name: "Agia Napa to Xylofagou",
    region: "ammochostos",
    distanceKm: null,
    bikeType: "road",
    surface: "paved",
    difficulty: "easy",
    description:
      "East-coast route linking Agia Napa with Xylofagou and the Famagusta district hinterland. Flat winter miles.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/agia-napa-pyrgos-xylofagou-cycling-route-3/",
  },
  {
    id: "eurovelo-8",
    name: "EuroVelo 8 — Mediterranean Route",
    region: "larnaka",
    distanceKm: null,
    bikeType: "road",
    surface: "paved",
    difficulty: "moderate",
    description:
      "Cyprus section of the European Mediterranean cycling corridor. Coastal connections between major towns.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/european-mediterranean-route-eurovelo-8/",
  },
  {
    id: "cy-rc08-ancient-vasilikos",
    name: "Ancient Vasilikos",
    region: "larnaka",
    distanceKm: null,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Larnaca district hills through Vasilikos peninsula villages. Rural lanes above the south-east coast.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc08-ancient-vasilikos/",
  },
  {
    id: "amathus-mtb-basic",
    name: "Amathus Mountain Biking (Basic)",
    region: "lemesos",
    distanceKm: null,
    bikeType: "mtb",
    surface: "unpaved",
    difficulty: "easy",
    description:
      "Introductory off-road loop near Ancient Amathus. Forest tracks and gentle climbs above the Limassol coast.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/suggestion-07-amathus-mountain-biking-basic/",
  },
  {
    id: "alaminos-mtb-moderate",
    name: "Alaminos Mountain Biking (Moderate)",
    region: "larnaka",
    distanceKm: null,
    bikeType: "mtb",
    surface: "unpaved",
    difficulty: "moderate",
    description:
      "Larnaca foothills singletrack and fire roads. Moderate technical riding; winter mud after rain.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/suggestion-12-alaminos-mountain-biking-moderate/",
  },
  {
    id: "alaminos-mtb-demanding",
    name: "Alaminos Mountain Biking (Demanding)",
    region: "larnaka",
    distanceKm: null,
    bikeType: "mtb",
    surface: "unpaved",
    difficulty: "demanding",
    description:
      "Longer, steeper Alaminos variant for experienced mountain bikers. Check trail conditions after storms.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/suggestion-14-alaminos-mountain-biking-demanding/",
  },
  {
    id: "lefkosia-3-asinou",
    name: "Lefkosia to Asinou",
    region: "lefkosia",
    distanceKm: null,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Nicosia district ride toward Adelfoi forest and the Asinou region. Pine-scented climbs without the Troodos summit.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/lefkosia-3-lefkosia-nicosia-asinou-cycling-route/",
    relatedPlaceId: "xyliatos-dam-cycle",
  },
  {
    id: "cy-rc18-traditional-villages",
    name: "Traditional Villages",
    region: "lemesos",
    distanceKm: null,
    isLoop: true,
    bikeType: "road",
    surface: "mixed",
    difficulty: "moderate",
    description:
      "Limassol hinterland loop through stone-built villages and wine-country lanes. Culture and climbing in one ride.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc18-traditional-villages/",
  },
];

export function getCyclingRouteById(id: string): CyclingRoute | undefined {
  return cyclingRoutes.find((r) => r.id === id);
}
