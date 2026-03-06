/** Shared winter tips for Cyprus. Used across homepage, discover, trails, airport. */

export type WinterTip = {
  id: string;
  category: "general" | "hiking" | "culture" | "wine" | "practical";
  title: string;
  body: string;
};

export const winterTipsGeneral: WinterTip[] = [
  {
    id: "daylight",
    category: "general",
    title: "Daylight is short",
    body: "Sunrise around 6:45am, sunset around 5pm in December and January. Plan outdoor activities for the morning. By 4pm the light is already golden. Use it.",
  },
  {
    id: "layers",
    category: "general",
    title: "Layer up",
    body: "The coast might be 18°C while Troodos is 5°C. Bring a windproof jacket, a warm mid-layer, and a hat. Mountain cafés have fireplaces. Coastal tavernas have heaters. Dress for both.",
  },
  {
    id: "book-ahead",
    category: "general",
    title: "Book winery tastings ahead",
    body: "Many wineries run small operations. In winter they appreciate a call or online booking. You'll often get the owner or winemaker pouring. Worth the extra step.",
  },
  {
    id: "weekday-quiet",
    category: "general",
    title: "Weekdays are quieter",
    body: "Omodos, Lefkara, and the main sites fill up on weekends. Tuesday or Wednesday? You'll have the cobbles to yourself. Villages feel different when the tour buses have gone. Plan big days for midweek.",
  },
  {
    id: "kafenion-stop",
    category: "general",
    title: "Stop for a coffee",
    body: "Village kafenions are where locals meet. Order a Greek coffee, sit, watch. No rush. In winter the stove is lit and the pace is slow. The person at the next table often knows the best winery, trail, or taverna. The best advice isn't in a guidebook.",
  },
  {
    id: "winter-light",
    category: "general",
    title: "The light is different",
    body: "Winter sun is lower. Golden hour starts around 3:30pm in December. Ancient sites, villages, the coast: everything looks different. Bring a camera. Or just watch. The light alone is worth the trip. Plan ruins and villages for the afternoon and you'll see why.",
  },
];

export const winterTipsHiking: WinterTip[] = [
  {
    id: "start-early",
    category: "hiking",
    title: "Start by 9am",
    body: "Winter daylight ends around 5pm. Give yourself time to finish in the light. The morning air is crisp. The trails are empty. You'll thank yourself when you're back at the car by 3.",
  },
  {
    id: "check-conditions",
    category: "hiking",
    title: "Check before you go",
    body: "Troodos weather changes fast. Snow on Olympus, mud after rain, ice on shaded sections. The ski resort posts conditions. So do local cafés. Ask. Don't assume.",
  },
  {
    id: "microspikes",
    category: "hiking",
    title: "Microspikes for Olympus",
    body: "Olympus Summit and higher Troodos trails can have snow and ice from January to March. Microspikes cost €20 and fit over your boots. If the forecast is near freezing, bring them.",
  },
  {
    id: "tell-someone",
    category: "hiking",
    title: "Tell someone your route",
    body: "Phone signal is patchy in the mountains. Tell your hotel or a friend which trail you're on and when you expect back. Emergency: 112. The mountain doesn't care about your deadline.",
  },
];

export const winterTipsPractical: WinterTip[] = [
  {
    id: "euro",
    category: "practical",
    title: "Euro, cards, and cash",
    body: "Cyprus uses the euro. Cards work almost everywhere. Small village shops and kafenions sometimes prefer cash. Keep €20 or so for coffee, lace, and zivania.",
  },
  {
    id: "drive-left",
    category: "practical",
    title: "Drive on the left",
    body: "British legacy. Rent a car if you want to reach villages and trails. The roads are good. Mountain bends can be tight. Take your time. The views are worth it.",
  },
  {
    id: "emergency",
    category: "practical",
    title: "Emergency numbers",
    body: "112 for EU emergency. 1460 for tourist information. 199 for ambulance. Save them. Hope you never need them.",
  },
];
