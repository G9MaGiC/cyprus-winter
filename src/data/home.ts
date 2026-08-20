import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";

export type HomeEditorialPick = {
  id: string;
  href: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
};

export const homeEditorsPicks: HomeEditorialPick[] = [
  {
    id: "omodos",
    href: "/discover/omodos",
    image: getAttractionImage("omodos", "village"),
    imageAlt: "Omodos village, wine heartland, cobbled streets—Cyprus winter",
    title: "Omodos",
    desc: "Cobbled streets, zivania, coffee in the wine heartland",
  },
  {
    id: "pafos-mosaics",
    href: "/discover/pafos-mosaics",
    image: getAttractionImage("pafos-mosaics", "ancient"),
    imageAlt: "Pafos Roman mosaics in soft winter light—Cyprus",
    title: "Pafos mosaics",
    desc: "Roman mosaics in soft winter light",
  },
  {
    id: "artemis",
    href: "/trails/artemis",
    image: getTrailImage("artemis"),
    imageAlt: "Artemis Trail, Troodos pine forest, Cyprus winter hiking",
    title: "Artemis Trail",
    desc: "7 km of pine forest and ridge views",
  },
  {
    id: "kourion",
    href: "/discover/kourion",
    image: getAttractionImage("kourion", "ancient"),
    imageAlt: "Kourion Greco-Roman ruins above Mediterranean, Cyprus winter",
    title: "Kourion",
    desc: "Roman ruins, sunset over the sea",
  },
];

export type HomeFeaturedWinery = {
  wineryId: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
};

export const homeFeaturedWineries: HomeFeaturedWinery[] = [
  {
    wineryId: "tsiakkas",
    title: "Tsiakkas",
    subtitle: "Troodos foothills · heaters on the terrace · book ahead",
    image: getAttractionImage("tsiakkas", "winery"),
    imageAlt: "Winter winery tasting in the Troodos foothills, Cyprus",
  },
  {
    wineryId: "vouni-panayia",
    title: "Vouni Panayia",
    subtitle: "Laona route · Commandaria comparisons · cosy winter room",
    image: getAttractionImage("vouni-panayia", "winery"),
    imageAlt: "Wine villages in the Paphos hills in winter light, Cyprus",
  },
  {
    wineryId: "domes-sergiou",
    title: "Dómes Sergiou",
    subtitle: "Between Larnaca & Limassol · indigenous varieties · modern",
    image: getAttractionImage("domes-sergiou", "winery"),
    imageAlt: "Modern Cypriot winery tasting, Cyprus winter",
  },
];
