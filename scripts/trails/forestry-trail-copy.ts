/**
 * Editorial copy for fd56 outside-forest trails (BUG-262 polish).
 * Stats remain authoritative from forestry-outside-manifest.json.
 */
export type ForestryTrailCopy = {
  description: string;
  highlights: string[];
  localSecret: string;
  winterNotes?: string;
  topSights?: string[];
};

export const FORESTRY_TRAIL_COPY: Record<string, ForestryTrailCopy> = {
  agiasma: {
    description:
      "Circular Paphos hills walk from Kathikas toward Pegeia. Two kilometres, grade 1, about 45 minutes through tall rock formations, vineyards, and a stone fountain with drinking water 800 m in. Excellent views of the Pegeia coastline on clear days.",
    highlights: ["Rock formations", "Stone fountain", "Pegeia coast views"],
    localSecret: "Pair with a Kathikas wine stop—the Laona hills reward a late-morning start.",
    winterNotes: "Mild Paphos hills. Can be muddy after rain.",
    topSights: ["Stone fountain", "Pegeia coastline"],
  },
  arnies: {
    description:
      "Circular grade 3 loop outside Agios Dimitrianos with short (3 km) or long (4 km) options. Hermit cave of St Dimitrianos, the Arnies spring, vineyards, working farms, and village facilities including water and toilets.",
    highlights: ["St Dimitrianos cave", "Arnies spring", "Village loop"],
    localSecret: "Take the long route if you have time—the spring names the trail for a reason.",
    winterNotes: "Mild Paphos hills. Grade 3 in places; allow 1–2 hours.",
  },
  "treis-elies": {
    description:
      "Linear 2.5 km along the Treis Elies River—grade 1, about one hour. Medieval bridges, cherry and walnut orchards, riparian shade, and the ruins of Agios Andronicos church. Return on the same path.",
    highlights: ["Medieval bridges", "River orchards", "Agios Andronicos ruins"],
    localSecret: "Best after rain when the river runs—otherwise still a gentle Limassol escape.",
    topSights: ["Treis Elies bridges", "Agios Andronicos"],
  },
  lemithou: {
    description:
      "Linear 2 km from the Leventis family residence through Kremmos Gorge, the Agros River, and the chapel of St George. Grade 2, about one hour. Can be made circular via the Treis Elies–Lemithou road.",
    highlights: ["Kremmos Gorge", "Agros River", "St George chapel"],
    localSecret: "Walk back via the road for a circular day with Treis Elies.",
  },
  kastrovounos: {
    description:
      "Short 800 m linear path in Kato Platres forest—grade 2, about 30 minutes. Views of Limassol, Troodos National Forest Park, and Paphos Forest. Well lit; popular for an evening stroll.",
    highlights: ["Kato Platres forest", "Troodos views", "Lit evening path"],
    localSecret: "Combine with Millomeris or Platres trout for a soft Troodos half-day.",
  },
  "dymes-pelendri": {
    description:
      "Linear village connector: 4.5 km, grade 1, about 1.5 hours from Dymes to Pelendri through orchards, pine, and the Deisi locality (throne of the Virgin Mary). Drinking fountain on route. Fire damage in 2007—regrowth ongoing.",
    highlights: ["Dymes to Pelendri", "Deisi viewpoint", "Forest fountain"],
    localSecret: "Old mule path feel—quiet Krasochoria connector between villages.",
  },
  arsos: {
    description:
      "Linear 2 km between Athkies and Poullin fountains in Arsos village—grade 1, 45 minutes. River walk past medieval Panagia chapel and a traditional oil mill. Can be walked in either direction.",
    highlights: ["Village fountains", "Panagia chapel", "Traditional oil mill"],
    localSecret: "Krasochoria wine villages nearby—Arsos rewards a slow pace.",
  },
  kalevounari: {
    description:
      "Circular 1.5 km loop in Kalevounari Park, Pano Polemidia—grade 1, 30 minutes. Views of the coast, western Limassol villages, and Troodos Mountains from the Polemidia picnic area.",
    highlights: ["Coast views", "Polemidia park", "Troodos backdrop"],
    localSecret: "Short Limassol escape—pair with Germasogeia Weir for a double loop.",
  },
  "germasogeia-weir": {
    description:
      "Circular 1.3 km around the Germasogeia reservoir peninsula—grade 1, 30 minutes. Stocked fishing (permit required), native Zoulatzia bush (Bosea cypria) on the 150 m south spur. Distinct from the longer Kyparissia dam trail.",
    highlights: ["Reservoir loop", "Zoulatzia bush", "Fishing weir"],
    localSecret: "Not the 13 km Kyparissia hike—this is the easy weir peninsula loop.",
  },
  "agros-kato-mylos": {
    description:
      "Circular 6 km from Agros—grade 2, about two hours through apple, cherry, pear, and rose (Rosa damascena) orchards. Agros rose water country; wooded sections and village road finish.",
    highlights: ["Rose orchards", "Agros rose water", "Mountain views"],
    localSecret: "Stop for loukoumi and rose products in Agros after the loop.",
    topSights: ["Damascena roses", "Agros village"],
  },
  "kalopanagiotis-oikos": {
    description:
      "Linear 4 km, grade 2, 1.5 hours from Kalopanayiotis to Oikos via Kykkos water mill, Setrachos River, hot springs, and UNESCO Agios Ioannis Lampadistis Monastery. Stone bridge and orchard fields en route.",
    highlights: ["UNESCO Lampadistis", "Setrachos valley", "Hot springs"],
    localSecret: "Start at the monastery for frescoes first, then walk toward Oikos.",
    topSights: ["Agios Ioannis Lampadistis", "Kykkos water mill"],
  },
  "archangelos-mylos-rodous": {
    description:
      "Linear 1 km, grade 1, 15–20 minutes from Archangelos church, Galata. Klarios riverside vegetation, Rodous mill buildings, and UNESCO Panagia Podithou church 200 m away.",
    highlights: ["Rodous mill", "Klarios riverside", "UNESCO Podithou"],
    localSecret: "Short UNESCO church pairing—Galata and Kakopetria in one day.",
    topSights: ["Panagia Podithou", "Rodous mill"],
  },
  "lagoudera-agros": {
    description:
      "Linear 6 km, grade 3, 2.5 hours from Lagoudera toward Agros through vineyards, orchards, and the Madari–Papoutsa ridge with panoramic views. Can link to Madari trail network at Adelfi Forest.",
    highlights: ["Madari ridge views", "Vineyard path", "Lagoudera start"],
    localSecret: "Near Panagia tou Araka trailhead—UNESCO churches plus ridge walking.",
    winterNotes: "Grade 3—arrange transport. Cooler and quieter in winter.",
  },
  "lagoudera-madari": {
    description:
      "Linear 7 km, grade 3, about three hours from Agros weir area toward Madari. Panoramic ridge walking; connects to the wider Madari fire-tower network.",
    highlights: ["Madari connection", "Ridge panoramas", "Agros weir start"],
    localSecret: "Link with madari-ridge for a full Adelfi day if fitness allows.",
    winterNotes: "Grade 3 linear—car at both ends or return via road.",
  },
  "polystypos-hazelnut": {
    description:
      "Linear 1.3 km through Polystypos hazelnut forest and orchards—grade 2, 30–45 minutes. Village fountain, Makroulis walnut tree, and an ~840-year oak at the trail end.",
    highlights: ["Hazelnut forest", "840-year oak", "Village fountain"],
    localSecret: "The ancient oak at the end is the payoff—allow time to linger.",
  },
  "pano-ambelia": {
    description:
      "Circular grade 3 loop at Askas village entrance—about 0.5–1 hour through pine, abandoned orchards, and hazelnut groves. Pentadaktylos range views.",
    highlights: ["Askas pine forest", "Hazelnut groves", "Pentadaktylos views"],
    localSecret: "Quiet Askas start—combine with Kakopetria or Machairas hinterland.",
    winterNotes: "Grade 3 short loop—exposed in summer; winter is comfortable.",
  },
  "petros-vanezis": {
    description:
      "Circular 1.5 km, grade 3, 30 minutes in Alona (Pitsilia). Stone village scenery, cherry and apple plantations, and a Natura 2000 river reach.",
    highlights: ["Alona stone village", "Orchard plantations", "Natura 2000 river"],
    localSecret: "Pitsilia character in a short loop—pair with Kakopetria lunch.",
  },
  gourri: {
    description:
      "Linear 3 km, grade 2, one hour from Gourri village fountain. Traditional dry-stone walls, local flora, and a natural waterfall at the trail end.",
    highlights: ["Dry-stone walls", "Natural waterfall", "Gourri village"],
    localSecret: "Waterfall at the end—go after rain for best flow.",
  },
  "machairas-lazanias": {
    description:
      "Linear 3 km, grade 3, one hour from Machairas Monastery. Crosses the Pediaios River with rich flora; E4 section linking to Lazanias–Fikardou routes.",
    highlights: ["Pediaios River", "E4 trail section", "Machairas link"],
    localSecret: "Extend toward Fikardou for a UNESCO village finish.",
    winterNotes: "Magic after rain—stream and greenery. Grade 3 river crossings.",
  },
  "lazanias-fikardou": {
    description:
      "Linear 2 km, grade 2, 45 minutes from Lazanias to UNESCO Fikardou village. Panoramic views, rich flora, E4 trail. Connects Machairas–Lazanias and Fikardou–Archontides.",
    highlights: ["Fikardou village", "E4 section", "Panoramic views"],
    localSecret: "End in Fikardou for preserved stone houses—arrange car at both ends.",
  },
  "fikardou-archontides": {
    description:
      "Linear 5 km, grade 2, 1.5 hours from Fikardou church to Archontides. Ridge walking with Nicosia and countryside views; E4 section through rich flora.",
    highlights: ["Ridge views", "E4 trail", "Archontides finish"],
    localSecret: "Part of the Machairas–Fikardou E4 chain—map the full linear day.",
  },
  "choirokoitia-trail": {
    description:
      "Linear 2 km, grade 2, 45 minutes linking Choirokoitia village and the UNESCO Neolithic archaeological site. Walk from the site parking or from the village direction.",
    highlights: ["UNESCO Neolithic site", "Village connector", "Archaeology walk"],
    localSecret: "Do the site first, then walk toward the village for context.",
    topSights: ["Choirokoitia UNESCO site"],
  },
  "panagia-agapis-vavla": {
    description:
      "Circular 10.5 km, grade 2, 3–4 hours from Vavla village centre. Rural roads to Panagia tis Agapis church, then footpath along St Minas River and ridge roads with panoramic views.",
    highlights: ["Panagia tis Agapis", "St Minas River", "Vavla loop"],
    localSecret: "Allow a full morning—Larnaca hinterland at its calmest in winter.",
    winterNotes: "Long loop; carry water. Mild Larnaca hills.",
  },
  "lefkara-metamorfoseos": {
    description:
      "Circular 2.3 km, grade 2, 1.5 hours from Pano Lefkara toward Vavatsinia. Views over Pano and Kato Lefkara, Kato Drys, Dipotamos dam, and Stavrovouni. Links to Lefkara–Kato Drys path.",
    highlights: ["Lefkara panoramas", "Metamorfoseos church", "Stavrovouni views"],
    localSecret: "Combine with lace shopping in Pano Lefkara before the walk.",
    topSights: ["Metamorfoseos tou Sotiros church"],
  },
  "profitis-ilias-konnoi": {
    description:
      "Linear 8.5 km, grade 1, about three hours from Profitis Ilias church (Protaras) to Konnos beach. Coastal churches, E4 parallel sections, links to Agioi Saranda, Agios Ioannis, and Konnos–Cyclops trails.",
    highlights: ["Profitis Ilias church", "Coastal churches", "Konnos beach finish"],
    localSecret: "End at Konnos for a swim in summer; winter means empty trails and mild air.",
    winterNotes: "Mild coastal winter walk. Arrange pickup at Konnos.",
    topSights: ["Konnos beach", "Profitis Ilias"],
  },
  "panagia-agios-ioannis": {
    description:
      "Linear 2.8 km, grade 1, 45 minutes between Panagia church (Cape Greco road) and Agios Ioannis / Agioi Saranda churches. E4 parallel sections; combine with coastal Cape Greco loops.",
    highlights: ["Coastal churches", "E4 parallel", "Cape Greco area"],
    localSecret: "Stitch into Profitis Ilias–Konnos for a longer Protaras coastal day.",
    winterNotes: "Year-round mild coastal classic.",
  },
  "panagia-agioi-saranda": {
    description:
      "Linear 2.5 km, grade 1, 45 minutes from Panagia church to Agioi Saranda church near Cape Greco. Picturesque chapel, E4 parallel route.",
    highlights: ["Agioi Saranda church", "E4 parallel", "Cape Greco coast"],
    localSecret: "Short church-to-church walk—pair with Konnos–Agioi Anargyroi loop.",
    winterNotes: "Ideal winter coastal walk; few crowds.",
  },
};
