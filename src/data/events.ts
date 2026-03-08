export type WinterEvent = {
  id: string;
  name: string;
  nameEl?: string;
  region: string;
  description: string;
  type: "festival" | "market" | "concert" | "food" | "culture" | "sport";
  month: "Nov" | "Dec" | "Jan" | "Feb" | "Mar";
  dates?: string;
  venue?: string;
  url?: string;
  /** Approximate coords for Right Now distance calculation */
  latitude?: number;
  longitude?: number;
};

export const winterEvents: WinterEvent[] = [
  {
    id: "limassol-carnival",
    name: "Limassol Carnival",
    nameEl: "Απόκριες Λεμεσού",
    region: "Limassol",
    description:
      "Cyprus's biggest carnival runs for two weeks before Lent. King Carnival leads the Grand Parade through the old town; masquerade balls fill the theatres; and the streets come alive with floats, costumes, and music. The carnival has roots in Venetian and Byzantine traditions; a last burst of revelry before the fast. Locals spend months preparing costumes. If you're in Cyprus in late February or early March, don't miss it. The energy is infectious, and the seafront promenade turns into one long party.",
    type: "festival",
    month: "Feb",
    dates: "2 weeks before Lent (late Feb / early Mar)",
    venue: "Limassol old town & seafront",
    latitude: 34.68,
    longitude: 33.04,
  },
  {
    id: "nicosia-winter-festival",
    name: "Nicosia Winter Festival",
    region: "Nicosia",
    description:
      "Eleftheria Square transforms in December: open-air concerts, food stalls, and light installations draw families and friends. Entry is free. The atmosphere is festive without being overwhelming; you can grab a hot drink, listen to live music, and watch the capital come alive after dark. It runs on weekends through the month. Wrap up and join the crowd.",
    type: "festival",
    month: "Dec",
    dates: "Weekends in December",
    venue: "Eleftheria Square",
    latitude: 35.17,
    longitude: 33.36,
  },
  {
    id: "pafos-xmas-market",
    name: "Paphos Christmas Market",
    region: "Paphos",
    description:
      "The harbour fills with stalls each December. Crafts, local honey, olive oil, and handmade gifts. Mulled wine steams in the cold air. Carol singers gather by the castle. It's a family affair; children queue for Santa, parents browse the stalls, and the smell of roasting chestnuts drifts across the waterfront. Weekends from the first of December until just before Christmas. The castle is lit up. The sea is dark. It feels like the holidays in a way that sun-drenched beaches never quite manage.",
    type: "market",
    month: "Dec",
    dates: "Weekends Dec 1 to 22",
    venue: "Paphos Harbour",
    latitude: 34.755,
    longitude: 32.408,
  },
  {
    id: "commandaria-festival",
    name: "Commandaria Festival",
    nameEl: "Γιορτή Κουμανταριά",
    region: "Limassol",
    description:
      "The Commandaria Festival celebrates Cyprus's oldest wine; the sweet, sun-dried wine that has been made in these hills since the Crusades. Koilani, Pera Pedi, and other Krasochoria villages host tastings, music, and traditional food. You can sample different producers, learn how Commandaria is made, and enjoy the mountain air. It's usually the first weekend of December, when the vines are bare and the villages are dressed for the occasion. A good excuse to explore the wine villages and fill a few bottles for the winter.",
    type: "food",
    month: "Dec",
    dates: "First weekend of December",
    venue: "Koilani, Pera Pedi, other Krasochoria",
    latitude: 34.823,
    longitude: 32.892,
  },
  {
    id: "troodos-ski-season",
    name: "Troodos Ski Season",
    nameEl: "Σκι Όλυμπος",
    region: "Troodos",
    description:
      "Cyprus has one ski resort, and it's on Mount Olympus. Four lifts, equipment hire, and mountain cafés. The season runs from January to March, depending on snow; some winters are bumper years, others are lean. Even when the pistes are thin, the drive up is rewarding and the cafés serve hot chocolate with a view. Check conditions before you go; the road can be icy. It's a novelty to ski in the morning and swim in the afternoon, and the island makes the most of it.",
    type: "sport",
    month: "Jan",
    dates: "Jan to Mar (weather-dependent)",
    venue: "Troodos Ski Resort, Mt Olympus",
    latitude: 34.94,
    longitude: 32.86,
  },
  {
    id: "lefkara-lace-festival",
    name: "Lefkara Lace Festival",
    region: "Larnaca",
    description:
      "The village celebrates its most famous craft. Lacemakers demonstrate the Lefkaritiko technique in the square; bobbins clicking, threads crossing. Workshops let you try your hand. Stalls sell finished pieces. It's usually the second Sunday of March, when the light is already softening and the mountain air is mild. The village fills with visitors, but the mood is proud rather than commercial. These women have spent decades perfecting their craft. They're happy to show you. Stay for lunch. The tavernas do a brisk trade.",
    type: "culture",
    month: "Mar",
    dates: "Usually second Sunday of March",
    venue: "Lefkara village",
    latitude: 34.868,
    longitude: 33.305,
  },
  {
    id: "bellapais-concerts",
    name: "Bellapais Abbey Concerts",
    region: "Kyrenia",
    description:
      "Music in the Gothic ruins. Classical, folk, sometimes both. The abbey's refectory becomes a concert hall; the arches throw the sound back. You sit under the stars with the mountain at your back. The programme changes each year; check ahead for winter dates. Even if you miss a concert, the abbey at night is worth the drive. The village spills down the hillside. Lights twinkle. It's one of those evenings that sticks in the memory.",
    type: "concert",
    month: "Dec",
    dates: "Selected dates Dec to Jan",
    venue: "Bellapais Abbey",
    latitude: 35.06,
    longitude: 33.28,
  },
  {
    id: "agros-rose-festival-prep",
    name: "Agros Village Events",
    region: "Troodos",
    description:
      "The roses bloom in April and May. In winter, Agros works with what it has stored: rose water, loukoumi, preserves. The village hosts workshops and tastings through January and February. You can learn how rose water is made, sample the sweets, and fill a bag with souvenirs. The mountain air is cold; the tavernas are warm. Agros has built a reputation on its floral heritage. Even out of season, it's worth a visit. The factory runs tours. The views are always there.",
    type: "food",
    month: "Jan",
    dates: "Various weekends Jan to Feb",
    venue: "Agros village",
    latitude: 34.92,
    longitude: 33.0,
  },
  {
    id: "larnaca-xmas-village",
    name: "Larnaca Christmas Village",
    region: "Larnaca",
    description:
      "Finikoudes Promenade turns into a winter village. An ice rink by the sea; surreal and fun. Santa's grotto for the children. Stalls selling crafts, food, and hot drinks. The palm trees stay green; the lights go up. It runs from mid-November into January, so you have plenty of chances to catch it. The promenade is Larnaca's waterfront strip. In summer it's packed. In winter it's milder, and the Christmas village adds a layer of cheer. Wrap up and stroll. The sea is right there.",
    type: "market",
    month: "Dec",
    dates: "Mid-Nov to early Jan",
    venue: "Finikoudes Promenade",
    latitude: 34.92,
    longitude: 33.63,
  },
  {
    id: "cyprus-marathon",
    name: "Cyprus Marathon",
    region: "Limassol",
    description:
      "Runners from across Europe gather on the Limassol seafront in December. Full marathon, half, and 10k. The route follows the coast; the weather is cool, the views are sea and sky. Even if you're not running, the atmosphere is worth experiencing. The city wakes early. The promenade fills with supporters. Cheering, music, the steady rhythm of feet. It's usually the first Sunday of December. Plan your route if you're driving; roads close for the race. Or join the crowd and watch. The finishers' faces say it all.",
    type: "sport",
    month: "Dec",
    dates: "Usually first Sunday of December",
    venue: "Limassol seafront",
    latitude: 34.68,
    longitude: 33.04,
  },
  {
    id: "kakopetria-christmas-village",
    name: "Kakopetria Christmas Village",
    region: "Troodos",
    description:
      "One of Cyprus's eight official Christmas villages. The Solea Valley village dresses up for the season: garlands, evening music, mulled wine, crafts fairs, and open-air concerts. Stone houses, the Karkotis River, and the scent of melomakarona and kourabiedes. Weekends from late November; daily from 22 December. Combine with a trout lunch or a walk to Agios Nikolaos tis Stegis. The mountain air sharpens the appetite.",
    type: "festival",
    month: "Dec",
    dates: "Weekends late Nov to 6 Jan; daily from 22 Dec",
    venue: "Kakopetria village",
    latitude: 34.988,
    longitude: 32.902,
  },
  {
    id: "kyperounta-christmas-village",
    name: "Kyperounta Christmas Village",
    region: "Troodos",
    description:
      "High-altitude Christmas market in the Pitsilia region. Vineyards and pine forests frame the village. Traditional treats, local Commandaria, crafts, and concerts. Kyperounta winery and the mountain air. Usually 10:00–19:00; shorter hours on 25 December. About 50 minutes from Limassol. Wrap up; it's cold up there.",
    type: "market",
    month: "Dec",
    dates: "Weekends late Nov to 6 Jan",
    venue: "Kyperounta village",
    latitude: 34.95,
    longitude: 32.98,
  },
  {
    id: "ayia-napa-cultural-winter",
    name: "Agia Napa Cultural Winter",
    nameEl: "Πολιτιστικός Χειμώνας Αγίας Νάπας",
    region: "Ayia Napa",
    description:
      "Weekly Thursday events from January to March. Greek and international jazz, traditional Cypriot dance, rebetiko, and cultural performances. The resort's quiet season becomes a stage for music and heritage. Check the programme for dates and venues. A different side of Ayia Napa.",
    type: "culture",
    month: "Jan",
    dates: "Jan to Mar, Thursdays 19:30",
    venue: "Agia Napa municipality",
    latitude: 34.99,
    longitude: 34.0,
  },
  {
    id: "ayia-napa-winter-swimming",
    name: "Agia Napa Winter Swimming Festival",
    region: "Ayia Napa",
    description:
      "International winter swimmers gather at Nissi or Makronissos Beach. Braving the cool sea in January. Even if you don't dive in, the spectacle is worth it—swimmers in caps, the winter light, the cheers. Dates vary; check ahead. A reminder that Cyprus never fully hibernates.",
    type: "sport",
    month: "Jan",
    dates: "Mid-January (check annually)",
    venue: "Nissi or Makronissos Beach",
    latitude: 34.987,
    longitude: 34.001,
  },
  {
    id: "kalopanagiotis-christmas-village",
    name: "Kalopanagiotis Christmas Village",
    nameEl: "Χριστουγεννιάτικο Χωριό Καλοπαναγιώτης",
    region: "Troodos",
    description:
      "The Marathasa Valley village hosts one of the island's most atmospheric Christmas markets. Stone houses, cobbled lanes, and the UNESCO monastery of Agios Ioannis Lampadistis as a backdrop. Local products, traditional foods, music, workshops, and winter entertainment. Runs weekends from late November; daily from 23 December. Thermal springs and Byzantine frescoes nearby. A quieter alternative to Kakopetria.",
    type: "festival",
    month: "Dec",
    dates: "Weekends late Nov to 22 Dec; daily 23 Dec–6 Jan",
    venue: "Kalopanagiotis village",
    latitude: 34.99,
    longitude: 32.83,
  },
  {
    id: "omodos-christmas-market",
    name: "Omodos Christmas Market",
    region: "Limassol",
    description:
      "The Krasochoria village of Omodos hosts a festive Christmas market in late December. The Community Park fills with stalls, live music—carols, rebetiko, jazz, folk—and workshops. Mega Santa meets children. Local products, warm wine, and handmade gifts. The cobbled square and monastery make a memorable setting. Usually 26–28 December, from 16:00. The village knows wine; expect good hospitality.",
    type: "market",
    month: "Dec",
    dates: "Usually 26–28 December",
    venue: "Omodos village square",
    latitude: 34.848,
    longitude: 32.811,
  },
  {
    id: "lania-christmas",
    name: "Lania Christmas",
    region: "Limassol",
    description:
      "The village of lanes and vines lights up in early December. Crafts, treats, and a small-scale Christmas atmosphere. Lania is one of the Krasochoria; combine with Omodos or Vasa for a wine-country day. Quieter than the big Christmas villages. The architecture and mountain views are the draw. Check dates; usually the first weekend of December.",
    type: "festival",
    month: "Dec",
    dates: "Usually first weekend of December",
    venue: "Lania village",
    latitude: 34.83,
    longitude: 32.84,
  },
  {
    id: "green-monday",
    name: "Green Monday",
    nameEl: "Καθαρά Δευτέρα",
    region: "All",
    description:
      "The first day of Orthodox Lent. Families head outdoors with picnics of fasting foods—lagana bread, olives, tahini, seafood. Kite flying fills the skies; the custom is that the kite carries away sins. Parks, hills, and coastlines fill with Cypriots. Polis-Latchi and other towns host festivals. It's a public holiday. Even if you're not fasting, the ritual and the kites are worth experiencing. Dates move with Easter; typically late February or early March.",
    type: "culture",
    month: "Feb",
    dates: "First day of Lent (varies with Easter)",
    venue: "Parks, beaches, hills across Cyprus",
    latitude: 34.95,
    longitude: 33.2,
  },
  {
    id: "famagusta-carnival",
    name: "Famagusta Carnival",
    nameEl: "Καρναβάλι Αμμοχώστου",
    region: "Paralimni",
    description:
      "The Paralimni–Dherynia carnival brings floats, costumes, and thousands of revellers to the east coast. The grand parade rolls through Paralimni on the Sunday before Lent. Less hectic than Limassol, but no less colourful. Families line the route; the carnival king leads the procession. A regional institution. Usually early March. Arrive early for a good spot.",
    type: "festival",
    month: "Mar",
    dates: "Sunday before Lent (early Mar)",
    venue: "Paralimni",
    latitude: 35.04,
    longitude: 33.98,
  },
  {
    id: "protaras-christmas",
    name: "Protaras Christmas Celebrations",
    region: "Protaras",
    description:
      "Fig Tree Bay and the Protaras waterfront light up in December. Carol singers, festive stalls, and New Year events. Quieter than summer; the palm trees and sea give the season a Mediterranean twist. Combine with Cape Greco or Konnos for a coastal day.",
    type: "festival",
    month: "Dec",
    dates: "Through December into early Jan",
    venue: "Protaras waterfront",
    latitude: 35.01,
    longitude: 34.06,
  },
  {
    id: "epiphany-cyprus",
    name: "Epiphany (Theophania)",
    nameEl: "Θεοφάνεια",
    region: "All",
    description:
      "On January 6, Cyprus marks Epiphany; the baptism of Christ. Priests throw a wooden cross into the sea; young men dive from boats and the harbour wall to retrieve it. Whoever finds it receives a blessing for the year. The ceremony takes place at harbours and beaches across the island; Larnaca, Limassol, Paphos, and other coastal towns. Crowds gather, hymns are sung, and even in winter the bravest swimmers take the plunge. It's a public holiday, and the atmosphere is solemn and celebratory at once. Wrap up warm and arrive early for a good spot.",
    type: "culture",
    month: "Jan",
    dates: "6 January",
    venue: "Coastal towns",
    latitude: 34.95,
    longitude: 33.2,
  },
];
