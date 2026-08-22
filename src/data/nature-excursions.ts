import type { NatureExcursion } from "@/lib/nature-excursion-types";

/** Curated Visit Cyprus “Sites of Interest” (official nature excursions list). */
export const natureExcursions: NatureExcursion[] = [
  {
    id: "akrotiri-salt-lake",
    name: "Akrotiri Salt Lake",
    region: "lemesos",
    kind: "wetland",
    description:
      "Cyprus's largest inland wetland — flamingos, cranes, and raptors Nov–Mar when winter rains fill the lake. Reed beds and shallow water; often drier by summer.",
    winterNote: "Peak bird migration window; bring binoculars and quiet shoes.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/akrotiri-salt-lake/",
    winterPick: true,
  },
  {
    id: "larnaca-salt-lake",
    name: "Larnaca Salt Lake",
    region: "larnaka",
    kind: "wetland",
    description:
      "Flamingos and Hala Sultan Tekke on the edge of Larnaca. Flat paths; one of the island's signature winter birding stops.",
    winterNote: "Combine with the Larnaca salt-lake trail loop in our Trails hub.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/larnaka-larnaca-salt-lake/",
    relatedTrailId: "larnaca-salt-lake",
    winterPick: true,
  },
  {
    id: "athalassa-visitor-centre",
    name: "Athalassa National Forest Park",
    region: "lefkosia",
    kind: "forest_park",
    description:
      "Pine and maquis on Nicosia's south-east edge — visitor centre, botanical garden, and a 16 km cycling path through the capital's green belt.",
    winterNote: "Quick escape when Troodos is iced over; stick to main tracks after rain.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/athalassa-national-forest-park-visitor-centre/",
    relatedPlaceId: "athalassa-forest-park",
    winterPick: true,
  },
  {
    id: "cape-gkreko-park",
    name: "Cape Gkreko National Forest Park",
    region: "ammochostos",
    kind: "forest_park",
    description:
      "Sea cliffs, pine scrub, and coastal paths on Cyprus's eastern tip. Winter sun without Troodos cold.",
    winterNote: "Pair with our Cape Greco trail for a full coastal morning.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/cape-gkreko-national-forest-park/",
    relatedTrailId: "cape-greco",
    winterPick: true,
  },
  {
    id: "cedar-valley",
    name: "Cedar Valley",
    region: "troodos",
    kind: "valley",
    description:
      "Indigenous Cyprus cedars in a Troodos valley — quiet forest road access; snow possible Jan–Feb on the approach.",
    winterNote: "Check road conditions before driving; worth the detour on clear winter days.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/cedar-valley/",
    winterPick: true,
  },
  {
    id: "troodos-botanic-garden",
    name: "Troodos Botanic Garden",
    region: "troodos",
    kind: "botanic",
    description:
      "Alpine and endemic plants at Troodos Square — small, focused, and warm inside when the square is cold.",
    winterNote: "Visitor centre hours shorten off-season; combine with a lower-elevation trail if snow closes roads.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/troodos-botanic-garden/",
    relatedPlaceId: "platres",
    winterPick: true,
  },
  {
    id: "troodos-environmental-centre",
    name: "Troodos Environmental Centre",
    region: "troodos",
    kind: "visitor_centre",
    description:
      "Forestry Department centre on the Troodos Geopark — geology, mining history, and winter mountain context before a trail.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/troodos-environmental-centre/",
    relatedPlaceId: "troodos-cycling-hub",
  },
  {
    id: "akamas-geology-centre",
    name: "Akamas Geology & Paleontology Centre",
    region: "pafos",
    kind: "visitor_centre",
    description:
      "Panos Arodes centre on the Akamas edge — fossils, geology, and context for the peninsula's trails and coast.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/akamas-geology-and-paleontology-information-center-panos-arodes/",
    relatedPlaceId: "akamas-latchi-cycling",
  },
  {
    id: "akamas-avifauna-kathikas",
    name: "Akamas Avifauna & Flora Centre",
    region: "pafos",
    kind: "visitor_centre",
    description:
      "Kathikas regional centre for Akamas birds and endemic plants — start here before Adonis or Aphrodite trails.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/regional-information-centre-of-avifauna-and-flora-of-akamas-kathikas/",
    relatedTrailId: "adonis",
  },
  {
    id: "akrotiri-env-centre",
    name: "Akrotiri Environmental Centre",
    region: "lemesos",
    kind: "visitor_centre",
    description:
      "Education centre beside Akrotiri wetlands — exhibits on salt-lake ecology and migrating birds.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/akrotiri-environmental-education-and-information-centre/",
  },
  {
    id: "cape-gkreko-env-centre",
    name: "Cape Gkreko Environmental Centre",
    region: "ammochostos",
    kind: "visitor_centre",
    description:
      "Coastal ecology displays at Cape Gkreko — useful context before the cliff paths and sea caves.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/environmental-information-and-education-centre-at-cape-gkreko/",
    relatedTrailId: "cape-greco",
  },
  {
    id: "episkopi-env-centre",
    name: "Episkopi Environmental Centre",
    region: "pafos",
    kind: "visitor_centre",
    description:
      "Paphos district environmental centre above Episkopi — Ezousa Valley views and local habitat interpretation.",
    visitCyprusUrl:
      "https://www.visitcyprus.com/discover-cyprus/nature/excursions/episkopi-environmental-information-centre-pafos-area/",
  },
];

export function getNatureExcursionById(id: string): NatureExcursion | undefined {
  return natureExcursions.find((e) => e.id === id);
}
