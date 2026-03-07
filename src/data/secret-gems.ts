/**
 * Secret gems — hyper-local tips that feel like insider knowledge.
 * The kind of advice a friend who lives here would give. Specific, honest, understated.
 */

/** Get secrets linked to a place or trail by id. */
export function getSecretsForPlace(placeId: string): SecretGem[] {
  return secretGems.filter((g) => g.placeId === placeId);
}

export type SecretGem = {
  id: string;
  title: string;
  body: string;
  region: string;
  /** Link to place or trail if relevant */
  placeId?: string;
  /** discover/[id] or trails/[id] */
  href?: string;
  type: "viewpoint" | "kafenion" | "timing" | "pairing" | "spot";
};

export const secretGems: SecretGem[] = [
  {
    id: "kourion-bench",
    title: "The bench at Kourion",
    body: "Nobody talks about the bench that faces the sea. It's at the far edge of the theatre, looking down over the bay. Go at 4pm in December. The light hits the ruins, the coast glows. You'll have it to yourself on a weekday. Governor's Beach is fifteen minutes away—ruins in the morning, fish at lunch.",
    region: "Limassol",
    placeId: "kourion",
    href: "/discover/kourion",
    type: "viewpoint",
  },
  {
    id: "omodos-blue-door",
    title: "The kafenion with the blue door",
    body: "In Omodos square, there's a kafenion with a blue door—the one the winemakers use. Order a Greek coffee. Sit. The zivania is better here than in the tourist spots. Winter mornings, the stove is lit and the village hasn't woken yet. Don't rush.",
    region: "Limassol",
    placeId: "omodos",
    href: "/discover/omodos",
    type: "kafenion",
  },
  {
    id: "pafos-far-cafe",
    title: "Paphos harbour, the far café",
    body: "The café at the far end of the harbour, past the castle. Tuesday 3pm. You'll have the sunset to yourself. The fishing boats, the stone, the light. In summer it's packed. Winter? Empty. Order a coffee. Stay until five.",
    region: "Paphos",
    placeId: "paphos-castle",
    href: "/discover/paphos-castle",
    type: "timing",
  },
  {
    id: "artemis-psilo-dendro",
    title: "Artemis, then Psilo Dendro",
    body: "Do Artemis in the morning. Finish by 1pm. Then drive to Platres and eat at Psilo Dendro taverna—the one by the river. The owner knows every hiker. Order the trout with almonds. The fireplace, the mountain air. It's the pairing locals do. Don't skip it.",
    region: "Troodos",
    placeId: "artemis",
    href: "/trails/artemis",
    type: "pairing",
  },
  {
    id: "lefkara-kato",
    title: "Skip Pano. Start in Kato.",
    body: "Everyone goes to Pano Lefkara first. Start in Kato Lefkara instead—the lower village. Quieter. The lacemakers sit in doorways. Fewer tour groups. Walk up to Pano when you're ready. The silver shops are in both. Kato has the pace.",
    region: "Larnaca",
    placeId: "lefkara",
    href: "/discover/lefkara",
    type: "spot",
  },
  {
    id: "nissi-winter-coffee",
    title: "Nissi in winter: the café that stays open",
    body: "One of the beach cafés stays open all winter. The one with the wooden deck. Order a coffee. Sit. The rock islet, the horizon, the empty sand. In summer you'd never get a seat. December? You might be the only one. The light is different. Take it.",
    region: "Ayia Napa",
    placeId: "nissi-beach",
    href: "/discover/nissi-beach",
    type: "kafenion",
  },
  {
    id: "kalopanagiotis-springs",
    title: "The thermal springs before the bridge",
    body: "Everyone visits the Venetian bridge. The thermal springs are at the edge of the village—ask at the museum or any local. A soak in winter feels like a gift. The valley is cold, the water is warm. Go early. The bridge after. Lampadistis church. In that order.",
    region: "Troodos",
    placeId: "kalopanagiotis",
    href: "/discover/kalopanagiotis",
    type: "spot",
  },
  {
    id: "zambartas-aes-ambelis",
    title: "Zambartas, then Aes Ambelis",
    body: "Twenty minutes from Limassol. Do both in one afternoon. Zambartas first—clean, modern, the Lefkada is a flagship. Then Aes Ambelis next door. Compare styles. The drive between is nothing. The winemakers know each other. They'll tell you. Two estates, one trip.",
    region: "Limassol",
    placeId: "zambartas",
    href: "/discover/zambartas",
    type: "pairing",
  },
  {
    id: "bellapais-tree",
    title: "The Tree of Idleness",
    body: "Durrell wrote that sitting under it made you lazy. He was right. In Bellapais square, order a coffee under the tree. A winter afternoon there is tradition. The abbey is above you. The village below. Don't rush. The tree has been there for centuries. It can wait.",
    region: "Kyrenia",
    placeId: "bellapais",
    href: "/discover/bellapais",
    type: "spot",
  },
  {
    id: "avakas-post-hike",
    title: "Avakas Gorge, then Avakas Winery",
    body: "Do the gorge in the morning. The narrowest point—where the sky becomes a strip—go slow. When you're done, call Avakas Winery. They're used to hikers. The Xynisteri from mountain vines has a different character. Ask. They'll tell you. Ten minutes by car from the trailhead.",
    region: "Paphos",
    placeId: "avakas-gorge",
    href: "/trails/avakas-gorge",
    type: "pairing",
  },
  {
    id: "lara-picnic",
    title: "Lara Beach: pack a picnic",
    body: "No sunbeds. No bars. Raw coast. Pack a picnic, bring water. In winter the turtles are gone and the beach is empty. You might see no one for hours. 4WD recommended for the access road. The golden sand, the turquoise water—this is the Akamas. Bring it with you. Leave nothing.",
    region: "Paphos",
    placeId: "lara-bay",
    href: "/discover/lara-bay",
    type: "spot",
  },
  {
    id: "louvaras-before-omodos",
    title: "Louvaras before Omodos",
    body: "On the Limassol–Troodos wine route. Louvaras is quieter than Omodos. Stop for a coffee first. The kafenions know how to welcome strangers. Then work up to Omodos and Koilani. Or do it backwards. Louvaras doesn't shout. It waits. The stone holds the sun in winter.",
    region: "Limassol",
    placeId: "louvaras",
    href: "/discover/louvaras",
    type: "timing",
  },
  {
    id: "marina-far-end",
    title: "The far end of the marina",
    body: "Everyone clusters near the entrance. Walk to the far end, toward the old fort. Fewer tourists, same views. The superyachts, the water. Order a coffee first. Sit. Let the marina settle. Then choose a restaurant. Don't rush the approach. The promenade rewards the walk. In winter the light hits the water at four.",
    region: "Limassol",
    placeId: "limassol-marina-restaurants",
    href: "/discover/limassol-marina-restaurants",
    type: "spot",
  },

  // ——— Nicosia ———
  {
    id: "leventis-first",
    title: "Leventis before Cyprus Museum",
    body: "Most visitors head straight to the Cyprus Museum. Go to Leventis first. It's free, intimate, tells Nicosia's story in a way the big museum can't. Two hours. Then Cyprus Museum. The context will make Kourion, Pafos, Choirokoitia come alive. On a rainy day: Leventis, then a café on Ledra Street. You'll thank yourself.",
    region: "Nicosia",
    placeId: "leventis-museum",
    href: "/discover/leventis-museum",
    type: "pairing",
  },
  {
    id: "ledra-buffer-zone",
    title: "Ledra Street: cross at 11am",
    body: "The pedestrian crossing into the buffer zone. Mid-morning, 11am, the light is soft and the queues are shorter. Walk through. The empty shops, the UN posts, the line painted on the ground. It takes five minutes. The weight of it stays. Combine with Leventis or a Ledra café. Don't rush the crossing. It matters.",
    region: "Nicosia",
    placeId: "leventis-museum",
    href: "/discover/leventis-museum",
    type: "timing",
  },

  // ——— Cape Greco & East Coast ———
  {
    id: "sea-caves-afternoon",
    title: "Sea Caves: go after 3pm",
    body: "The limestone glows amber when the sun is low. Go after 3pm in winter. The angle of the light hits the arches. Bring a wind layer—the cliffs catch the breeze. In summer it's packed. December? You might have the caves to yourself. Combine with Konnos Bay: walk the coastal path, drop down for a coffee. The light does the rest.",
    region: "Ayia Napa",
    placeId: "ayia-napa-sea-caves",
    href: "/discover/ayia-napa-sea-caves",
    type: "timing",
  },

  // ——— Paphos ———
  {
    id: "tomb-of-kings-light",
    title: "Tomb of Kings: late afternoon",
    body: "The underground tombs stay cool. In winter the contrast with the mild coastal air is striking. Go mid-morning if you want the tombs first. Or late afternoon: the light on the stone, the shadows long. The site closes at 5pm in winter. Get there by 3:30. You'll have an hour and a half. The scale hits differently when the sun is low.",
    region: "Paphos",
    placeId: "tomb-of-kings",
    href: "/discover/tomb-of-kings",
    type: "timing",
  },
  {
    id: "kouklia-cafe",
    title: "Kouklia: the café with the ruins",
    body: "Palaipafos sits in the village. There's a café. Order a coffee. The ruins are over your shoulder. The pace here is slower than Paphos harbour. Fewer tour buses. The temple of Aphrodite, the Roman mosaics—they're right there. Sit. The village doesn't rush. Neither should you.",
    region: "Paphos",
    placeId: "palaipafos",
    href: "/discover/palaipafos",
    type: "kafenion",
  },
  {
    id: "adonis-polis-loop",
    title: "Adonis or Aphrodite, then Polis",
    body: "Do the trail in the morning. Finish by 1pm. Drive to Polis for lunch. The harbour tavernas serve fish that's fresh. Kolios and Vasilikon wineries are on the loop back. Or skip the wine and just eat. The trail earns you the meal. Polis knows how to feed hikers. Two days if you can: hike, eat, sleep, repeat.",
    region: "Paphos",
    placeId: "adonis",
    href: "/trails/adonis",
    type: "pairing",
  },

  // ——— North Cyprus ———
  {
    id: "st-hilarion-window",
    title: "St Hilarion: the Queen's Window",
    body: "In the lower ward, there's a window that frames the sea. It's the shot. Get there early—before 10am—and you might have it to yourself. The castle climbs; the Queen's Window is worth the steps. The coast spreads out below. Kyrenia, the harbour, the horizon. Dress in layers. The wind never stops. But the window? Worth the steps.",
    region: "Kyrenia",
    placeId: "st-hilarion",
    href: "/discover/st-hilarion",
    type: "viewpoint",
  },

  // ——— Limassol ———
  {
    id: "kolossi-sugar-mill",
    title: "Kolossi: the free bit",
    body: "Everyone pays for the castle. The sugar mill ruins beside it are free. Walk over. Commandaria was made here for eight hundred years. The stones are atmospheric. Rarely crowded. Do the castle first—climb to the roof. Then the ruins. Pair with Zambartas or Kolios for a tasting. Thirty minutes at Kolossi. The rest of the afternoon for wine.",
    region: "Limassol",
    placeId: "kolossi",
    href: "/discover/kolossi",
    type: "spot",
  },
  {
    id: "governors-coves",
    title: "Governor's Beach: find your cove",
    body: "The coast has a string of coves. Don't stop at the first. Drive along. Find a pocket. The white cliffs, the dark volcanic sand—the contrast is striking in winter light. On a mild December afternoon, the cliff tavernas do lunch. Sit outside with a blanket. The fish is fresh. Amathus and Kourion are fifteen minutes away. Ruins in the morning, fish at lunch. The coast rewards the patient.",
    region: "Limassol",
    placeId: "governors-beach",
    href: "/discover/governors-beach",
    type: "spot",
  },

  // ——— Larnaca ———
  {
    id: "choirokoitia-mist",
    title: "Choirokoitia: misty morning",
    body: "Winter mornings can be misty. Go early. The hilltop settlement feels suspended between past and present. Seven thousand years. The defensive wall makes sense from the top. Climb there first. The reconstructed dwellings, the round houses—you'll see the layout. Allow an hour and a half. Then Lefkara for lace and lunch. Or the Cyprus Museum in Nicosia for context. Choirokoitia deserves the morning.",
    region: "Larnaca",
    placeId: "choirokoitia",
    href: "/discover/choirokoitia",
    type: "timing",
  },

  // ——— Troodos ———
  {
    id: "millomeris-platres",
    title: "Millomeris, then Platres lunch",
    body: "Do Millomeris in the morning. Short trail. The waterfall. Finish by noon. Drive to Platres. The trout tavernas or a café by the river. It's a gentle half-day. Ideal when you don't want a full mountain push. The village knows hikers. Order the trout with almonds. The fireplace. The mountain can wait.",
    region: "Troodos",
    placeId: "millomeris-falls",
    href: "/trails/millomeris-falls",
    type: "pairing",
  },
  {
    id: "fikardou-square",
    title: "Fikardou: stand in the square",
    body: "The village was nearly abandoned. Now it's a living museum. You can walk it in twenty minutes. Give yourself an hour. Stand in the square. Listen. The wooden balconies. The stone. The Pitsilia region rolls away. The museum key lives at the Folk Art Museum—ask there. The Rural Life Museum tells how mountain families survived. Step back. The silence is the gift.",
    region: "Nicosia",
    placeId: "fikardou",
    href: "/discover/fikardou",
    type: "spot",
  },
  {
    id: "kyperounta-fire-tower",
    title: "Madari Ridge: the fire tower",
    body: "At km 2.5 on the Madari Ridge trail, there's a fire watchtower. Climb it if you can. The 360° views are worth the extra steps. Kyperounta Winery is nearby—highest vineyard in Cyprus. Combine the trail with a tasting. Call ahead. They're used to hikers. The valley light in winter is golden. Don't skip the tower.",
    region: "Troodos",
    placeId: "madari-ridge",
    href: "/trails/madari-ridge",
    type: "viewpoint",
  },

  // ——— Rainy day ———
  {
    id: "rainy-nicosia",
    title: "Rainy day: Nicosia",
    body: "When the mountains are wet and the coast is grey, Nicosia works. Leventis first—free, intimate. Then Cyprus Museum—nine thousand years. Then a café on Ledra Street. The buffer zone crossing if you're up for it. The old town. You can spend a full day indoors and still feel like you've seen Cyprus. The rain outside fades. The galleries hold you.",
    region: "Nicosia",
    placeId: "leventis-museum",
    href: "/discover/leventis-museum",
    type: "pairing",
  },

  // ——— Non-tourist locations ———
  {
    id: "lofou-before-omodos",
    title: "Lofou: before Omodos",
    body: "Lofou sits above Omodos on the wine route. Fewer tour buses. Stone houses, a quiet square, and kafenions that locals actually use. Stop for a coffee on the way to or from Omodos. The village doesn't perform. It just is. Winter weekday mornings you might have the square to yourself. Krasas winery and Monagri are nearby. The road between Lofou and Omodos is one of the prettiest in the Krasochoria.",
    region: "Limassol",
    placeId: "lofou",
    href: "/discover/lofou",
    type: "spot",
  },
  {
    id: "zygi-fish-tavernas",
    title: "Zygi: the fishing village",
    body: "Between Larnaca and Limassol. No ruins, no lace. Just fish. The tavernas line the harbour; they serve what the boats brought in that morning. Locals eat here. Tourists rarely find it. Winter lunch on the waterfront—octopus, sea bream, calamari. The pace is slow. The coffee after is obligatory. Combine with Kiti and the Angeloktisti church, or Choirokoitia. Zygi is where Cypriots go for Sunday fish. You should too.",
    region: "Larnaca",
    placeId: "zygi-tavernas",
    href: "/discover/zygi-tavernas",
    type: "spot",
  },
  {
    id: "laiki-geitonia-market",
    title: "Laiki Geitonia: the old town market",
    body: "Nicosia's old town. Laiki Geitonia is the restored neighbourhood—narrow streets, craft shops, cafés. Fewer tour groups than Ledra. Wander. Find the market street. In winter the light hits the stone. Combine with Leventis or the buffer zone crossing. It's where locals still shop for herbs and honey. The kind of place that feels lived-in, not staged.",
    region: "Nicosia",
    placeId: "leventis-museum",
    href: "/discover/leventis-museum",
    type: "spot",
  },
  {
    id: "vavla-quiet-escape",
    title: "Vavla: the village nobody mentions",
    body: "Between Larnaca and Troodos. No lace, no wine route fame. Just quiet lanes, olive groves, and guesthouses that offer silence. In winter you might be the only visitor. The village sits in a fold of the hills. Walk the streets. Find the kafenion. The pace is slow. It's the kind of place where you stay one night and wish for two. Use it as a base for Lefkara, Choirokoitia, or the Troodos. Or don't. Just be there.",
    region: "Larnaca",
    placeId: "vavla",
    href: "/discover/vavla",
    type: "spot",
  },
  {
    id: "foini-potters",
    title: "Foini: watch a potter",
    body: "Foini is known for pottery. The workshops are in the village. Ask at any shop—they'll point you. Watch a potter at the wheel. The smell of clay and wood smoke. They're proud of the craft. It's not a show; it's how they work. Quieter than Omodos. The village has a different rhythm. Combine with Platres or a Troodos trail. Foini rewards the curious. Give yourself a morning.",
    region: "Limassol",
    placeId: "foini",
    href: "/discover/foini",
    type: "spot",
  },
  {
    id: "kritou-terra-akamas",
    title: "Kritou Terra: the Akamas village",
    body: "Before Polis, before the Baths of Aphrodite. Kritou Terra sits in the hills above the Akamas. A few hundred people. A kafenion. No tour buses. The views run down to the coast. Stop for a coffee if you're driving to Lara or the Adonis trailhead. The village doesn't expect you. That's the point. The road through is scenic. Take it slow.",
    region: "Paphos",
    placeId: "kritou-terra",
    href: "/discover/kritou-terra",
    type: "spot",
  },
  {
    id: "kormakitis-maronite",
    title: "Kormakitis: the Maronite village",
    body: "North Cyprus. Kormakitis is one of four Maronite villages—Arabic-speaking Cypriots who've been here since the 12th century. The church, the square, the sense of a culture that has survived. It's not on the main tourist loop. You need a car. But if you're exploring the north—Bellapais, St Hilarion, Kyrenia—add Kormakitis. The village speaks a different Cyprus. Winter mornings are quiet. The light on the stone is worth the drive.",
    region: "Kyrenia",
    placeId: "kormakitis",
    href: "/discover/kormakitis",
    type: "spot",
  },
  {
    id: "statos-village-wine",
    title: "Statos: the village behind the wine",
    body: "Statos is a wine village. Chrysorrogiatissa monastery is nearby. But the village itself—stone houses, a square, a kafenion—gets overlooked. Stop. Walk. The pace is slower than Omodos or Koilani. Tria Elit winery is here. The village feeds into the wine; the wine doesn't define the village. Winter light. Silence. The kind of place you find when you're not looking.",
    region: "Paphos",
    placeId: "chrysorrogiatissa",
    href: "/discover/chrysorrogiatissa",
    type: "spot",
  },
  {
    id: "kiti-angeloktisti",
    title: "Kiti: the church the buses miss",
    body: "Kiti village, near Larnaca airport. The church of Angeloktisti—built by angels, the legend says—holds a 6th-century mosaic of the Virgin and Child. One of the oldest surviving Byzantine mosaics in the eastern Mediterranean. Most tour buses skip it. The village is quiet. The church is small, intimate. Allow forty minutes. Combine with Zygi for fish lunch, or Larnaca. It's the kind of detour that changes your sense of the island.",
    region: "Larnaca",
    placeId: "angeloktisti",
    href: "/discover/angeloktisti",
    type: "spot",
  },
];
