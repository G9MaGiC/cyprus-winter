/**
 * Maps Visit Cyprus nature-trail URL slugs → Cyprus Winter trail ids in src/data/trails.ts.
 * Source: visitcyprus.com post sitemaps (Forestry / CTO official trail pages).
 */
export const VISITCYPRUS_SLUG_TO_TRAIL_ID: Record<string, string> = {
  "adonis-circular-pafos-paphos-district-akamas-forest-nature-trail": "adonis",
  "agia-eirini-limeria-linear-lefkosia-nicosia-district-adelfoi-forest-nature-trail": "agia-irini",
  "aphrodite-circular-ammochostos-famagusta-district-cape-gkreko-national-forest-park-nature-trail":
    "aphrodite-cape-greco",
  "aphrodite-circular-pafos-paphos-district-akamas-forest-nature-trail": "aphrodite",
  "artemis-circular-lemesos-limassol-district-troodos-forest-nature-trail": "artemis",
  "atalanti-circular-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail": "atalante",
  "avakas-gorge-linear-pafos-paphos-district-akamas-forest-nature-trail": "avakas-gorge",
  "chrysovrysi-linear-lemesos-limassol-district-troodos-forest-nature-trail": "chrysovrysi",
  "doxa-soi-o-theos-pyrofylakio-fire-lookout-station-madaris-linear-lefkosia-nicosia-district-adelfoi-forest-nature-trail":
    "madari-ridge",
  "fragma-dam-prodromou-stavroulia-linear-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail":
    "prodromos-dam-stavroulia",
  "kalidonia-linear-lemesos-limassol-district-troodos-forest-nature-trail": "caledonia-falls",
  "kampos-tou-livadiou-circular-lemesos-limassol-lefkosia-nicosia-district-troodos-forest-nature-trail":
    "kampos-tou-livadiou",
  "kannoures-agios-nikolaos-tis-stegis-linear-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail":
    "kannoures-agios-nikolaos",
  "kavos-circular-ammochostos-famagusta-district-cape-gkreko-national-forest-park-nature-trail": "kavos-trail",
  "kionia-profitis-ilias-linear-lefkosia-nicosia-district-machairas-forest-nature-trail":
    "kionia-profitis-elias",
  "konnoi-agioi-anargyroi-circular-ammochostos-famagusta-district-cape-gkreko-national-forest-park-nature-trail":
    "agioi-anargyroi-circular",
  "konnoi-cyclops-cave-circular-ammochostos-famagusta-district-cape-gkreko-national-forest-park-nature-trail":
    "konnoi-cyclops",
  "kyparissia-ydatofraktis-dam-germasogeias-linear-lemesos-limassol-district-lemesos-forest-nature-trail":
    "germasogeia-kyparissia",
  "livadi-circular-lefkosia-nicosia-district-troodos-forest-nature-trail": "livadi-trail",
  "loumata-ton-aeton-linear-lemesos-limassol-district-troodos-forest-nature-trail": "loumata-ton-aeton",
  "mnimata-piskopon-linear-lefkosia-nicosia-district-troodos-forest-nature-trail": "mnimata-piskopon",
  "persephone-linear-lemesos-limassol-district-troodos-forest-nature-trail": "persephone",
  "pissouromoutti-circular-pafos-paphos-district-akamas-forest-nature-trail": "pissouromoutti",
  "prodromos-zoumi-linear-lemesos-limassol-lefkosia-nicosia-districts-troodos-forest-nature-trail":
    "prodromos-zoumi",
  "psilondentro-tall-tree-pouziaris-circular-lemesos-limassol-district-troodos-forest-nature-trail":
    "psilo-dentro-pouziaris",
  "sea-caves-agioi-anargyroi-linear-ammochostos-famagusta-district-cape-gkreko-national-forest-park-nature-trail":
    "sea-caves-anargyroi",
  "smigies-circular-pafos-paphos-district-akamas-forest-nature-trail": "smigies",
  "teisia-tis-madaris-circular-lefkosia-nicosia-lemesos-limassol-districts-adelfoi-forest-nature-trail":
    "madari-ridge",
  "trooditissa-foini-linear-lemesos-limassol-district-troodos-forest-nature-trail": "trooditissa-phini",
  "xyliatos-circular-lefkosia-nicosia-district-adelfoi-forest-nature-trail": "xyliatos-dam",
};

/** Alternate Smigies page outside nature-trails-2/ prefix. */
export const VISITCYPRUS_ALT_TRAIL_SLUGS = [
  "smigies-circular-pafos-paphos-district-akamas-forest-nature-trail",
] as const;

export const VISITCYPRUS_TRAIL_PAGE_URLS = [
  ...Object.keys(VISITCYPRUS_SLUG_TO_TRAIL_ID).map(
    (slug) => `https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/${slug}/`,
  ),
  "https://www.visitcyprus.com/discover-cyprus/smigies-circular-pafos-paphos-district-akamas-forest-nature-trail/",
];
