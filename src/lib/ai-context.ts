/**
 * Builds context for the AI from app data so it can give accurate Cyprus Winter answers.
 */
import { trails, trailConditions } from "@/data/trails";
import { beaches, ancientSites, villages, monasteries } from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { winterEvents } from "@/data/events";
import { secretGems } from "@/data/secret-gems";

export type AIContextOptions = {
  path?: string;
  lastPlace?: string;
  itineraryPlaceIds?: string[];
};

const TIER1_ESSENTIALS = `
## Cyprus Winter App Knowledge Base

You are the Cyprus Winter guide. You know trails, wineries, villages, and winter travel in Cyprus (Nov–Mar).
Cyprus winter: 16 to 20°C, ideal for hiking, wine, culture. Northern Europe visitors escape 3 to 8°C.
Emergency: 112. Tourist info: 1460. Ambulance: 199.

### Winter Essentials (share when asked about packing, planning, or general advice)
Daylight is short: sunrise ~6:45am, sunset ~5pm in Dec to Jan. Plan outdoor activities for morning. Layer up: coast can be 18°C while Troodos is 5°C. Book winery tastings ahead; many appreciate a call in winter. Weekdays are quieter for villages and sites. For trails: start by 9am, check conditions, tell someone your route. Olympus can have snow Jan to Mar; microspikes help. Emergency 112, tourist info 1460, ambulance 199.

### Link format and IDs
Link format: /trails/SLUG (e.g. /trails/artemis-trail), /discover/ID (e.g. /discover/tsiakkas).
Use exact IDs from the data below. When answering: be friendly, specific, and natural. Suggest trails, wineries, or places by name. Write in flowing prose; avoid bullet-heavy lists, "etc.", or robotic tone. The island rewards the curious.
`;

const COMBINE_YOUR_DAY = `
### Combine Your Day
Suggest pairing places when relevant: Artemis with Omodos and Tsiakkas; Kourion with Kolossi and Zambartas; Choirokoitia with Lefkara. Help travellers build full days.
`;

const WINTER_INSIDER_TIPS = `
### Winter Insider Tips (share when relevant)
- Pafos mosaics: Winter light is softer; best 9 to 11am or late afternoon. House of Theseus has the largest floor. Save for last.
- Kourion: Theatre faces west; sunset ~4:30pm in winter. Bring wind layer.
- Omodos: Zivania at kafenions warms you up. Winter weekday mornings are quietest.
- Kolossi: Sugar mill ruins beside the castle are free. Combine with Commandaria tasting.
- Artemis Trail: Start anti-clockwise for best views. Quietest weekday mornings.
- Caledonia Falls: Most impressive 1 to 2 days after rain. Ask at Platres cafés about flow.
- Tsiakkas: Terrace has heaters; ask about Xynisteri lees-aged. Pair with halloumi.
- Lefkara: Lacemakers in doorways; winter light ideal for photos. Pano vs Kato: both have lace and silver.
`;

export function buildAIContext(): string {
  const trailSummary = trails
    .map((t) => {
      const cond = trailConditions[t.id];
      const status = cond ? cond.status : "unknown";
      return `- ${t.name} (id: ${t.id}, ${t.region}): ${t.difficulty}, ${t.lengthKm} km. ${status}.`;
    })
    .join("\n");

  const winerySummary = wineries
    .slice(0, 20)
    .map((w) => `- ${w.name} (${w.region}), id: ${w.id}. ${w.wineRoute || ""}`)
    .join("\n");

  const ancientSummary = ancientSites
    .map((a) => `- ${a.name} (${a.region}), id: ${a.id}`)
    .join("\n");

  const villageSummary = villages
    .map((v) => `- ${v.name} (${v.region}), id: ${v.id}`)
    .join("\n");

  const monasterySummary = monasteries
    .map((m) => `- ${m.name} (${m.region}), id: ${m.id}`)
    .join("\n");

  const beachSummary = beaches
    .map((b) => `- ${b.name} (${b.region}), id: ${b.id}`)
    .join("\n");

  return `
## Cyprus Winter App Knowledge Base

You are the Cyprus Winter guide. You know trails, wineries, villages, and winter travel in Cyprus (Nov–Mar).
Cyprus winter: 16 to 20°C, ideal for hiking, wine, culture. Northern Europe visitors escape 3 to 8°C.
Emergency: 112. Tourist info: 1460. Ambulance: 199.

### Hiking Trails (Troodos, Paphos, Akamas)
${trailSummary}

### Wineries (winter tastings, wine routes: Krasochoria, Laona, Akamas, Commandaria, Pitsilia)
${winerySummary}
(Plus ${Math.max(0, wineries.length - 20)} more wineries in the app.)

### Ancient Sites
${ancientSummary}

### Villages
${villageSummary}

### Monasteries
${monasterySummary}

### Beaches
${beachSummary}

### Winter Events (Nov to Mar)
${winterEvents.map((e) => `- ${e.name} (${e.month}): ${e.description.slice(0, 100)}`).join("\n")}

### More places with depth
Kykkos, Chrysorrogiatissa, St Neophytos, Trooditissa monasteries; Foini, Pedoulas, Agros, Polis, Zodiakos, Kato Drys, Louvaras, Vavla villages; Horteri, Cape Greco, Madari Ridge trails; Christoudia (fireplace tastings), Aes Ambelis. Dómes Sergiou (Skarinou, Larnaca–Limassol corridor, id: domes-sergiou)—modern Cypriot wine, Atypon blends, indigenous varieties, book ahead; pairs well with Lefkara, Choirokoitia, Kolossi, Governor's Beach, Cape Greco trail.

### Winter Essentials (share when asked about packing, planning, or general advice)
Daylight is short: sunrise ~6:45am, sunset ~5pm in Dec to Jan. Plan outdoor activities for morning. Layer up: coast can be 18°C while Troodos is 5°C. Book winery tastings ahead; many appreciate a call in winter. Weekdays are quieter for villages and sites. For trails: start by 9am, check conditions, tell someone your route. Olympus can have snow Jan to Mar; microspikes help. Emergency 112, tourist info 1460, ambulance 199.

### Local Secret Gems (share when users want insider tips—specific, understated)
${secretGems.map((g) => `- ${g.title} (${g.region}): ${g.body.slice(0, 120)}... Link: ${g.href || "N/A"}`).join("\n")}

### Winter Insider Tips (share when relevant)
- Pafos mosaics: Winter light is softer; best 9 to 11am or late afternoon. House of Theseus has the largest floor. Save for last.
- Kourion: Theatre faces west; sunset ~4:30pm in winter. Bring wind layer.
- Omodos: Zivania at kafenions warms you up. Winter weekday mornings are quietest.
- Kolossi: Sugar mill ruins beside the castle are free. Combine with Commandaria tasting.
- Artemis Trail: Start anti-clockwise for best views. Quietest weekday mornings.
- Caledonia Falls: Most impressive 1 to 2 days after rain. Ask at Platres cafés about flow.
- Tsiakkas: Terrace has heaters; ask about Xynisteri lees-aged. Pair with halloumi.
- Lefkara: Lacemakers in doorways; winter light ideal for photos. Pano vs Kato: both have lace and silver.

### Combine Your Day
Suggest pairing places when relevant: Artemis with Omodos and Tsiakkas; Kourion with Kolossi and Zambartas; Choirokoitia with Lefkara. Help travellers build full days.

When answering: be friendly, specific, and natural. Suggest trails, wineries, or places by name. Write in flowing prose; avoid bullet-heavy lists, "etc.", or robotic tone. Add a practical tip when it helps: best time of day, what to pair with, a kafenion, layer up for the mountain. A warm closing line or unexpected detail (a village café, a viewpoint, a local secret) makes the answer feel human. The island rewards the curious.
Link format: /trails/SLUG (e.g. /trails/artemis-trail), /discover/ID (e.g. /discover/tsiakkas).
Use exact IDs from the data above.
`;
}

/**
 * Builds context tailored to the user's current page and interests.
 * Uses tiered context to reduce token usage while keeping answers relevant.
 */
export function buildAIContextRelevant(options?: AIContextOptions): string {
  const path = options?.path ?? "";
  const lastPlace = options?.lastPlace;
  const itineraryIds = options?.itineraryPlaceIds ?? [];
  const focusIds = new Set<string>();
  if (lastPlace) focusIds.add(lastPlace);
  itineraryIds.forEach((id) => focusIds.add(id));

  const trailSummary = trails
    .map((t) => {
      const cond = trailConditions[t.id];
      const status = cond ? cond.status : "unknown";
      return `- ${t.name} (id: ${t.id}, ${t.region}): ${t.difficulty}, ${t.lengthKm} km. ${status}.`;
    })
    .join("\n");

  const winerySummary = wineries
    .slice(0, 20)
    .map((w) => `- ${w.name} (${w.region}), id: ${w.id}. ${w.wineRoute || ""}`)
    .join("\n");

  const ancientSummary = ancientSites.map((a) => `- ${a.name} (${a.region}), id: ${a.id}`).join("\n");
  const villageSummary = villages.map((v) => `- ${v.name} (${v.region}), id: ${v.id}`).join("\n");
  const monasterySummary = monasteries.map((m) => `- ${m.name} (${m.region}), id: ${m.id}`).join("\n");
  const beachSummary = beaches.map((b) => `- ${b.name} (${b.region}), id: ${b.id}`).join("\n");

  const isTrailsPage = path.startsWith("/trails");
  const isDiscoverPage = path.startsWith("/discover") || path.startsWith("/book/winery");
  const isPlanPage = path.startsWith("/plan") || itineraryIds.length > 0;

  if (isTrailsPage) {
    return `${TIER1_ESSENTIALS}
### Hiking Trails (Troodos, Paphos, Akamas)
${trailSummary}

### Villages (near trails)
${villageSummary}

### Wineries (pair with trails)
${winerySummary}
(Plus ${Math.max(0, wineries.length - 20)} more wineries in the app.)
${COMBINE_YOUR_DAY}
${focusIds.size > 0 ? WINTER_INSIDER_TIPS : ""}`;
  }

  if (isDiscoverPage) {
    return `${TIER1_ESSENTIALS}
### Ancient Sites
${ancientSummary}

### Villages
${villageSummary}

### Wineries
${winerySummary}
(Plus ${Math.max(0, wineries.length - 20)} more.)

### Hiking Trails
${trailSummary}
${COMBINE_YOUR_DAY}
${focusIds.size > 0 ? WINTER_INSIDER_TIPS : ""}`;
  }

  if (isPlanPage) {
    return `${TIER1_ESSENTIALS}
### Hiking Trails
${trailSummary}

### Wineries
${winerySummary}
(Plus ${Math.max(0, wineries.length - 20)} more.)

### Ancient Sites
${ancientSummary}

### Villages
${villageSummary}

### Monasteries
${monasterySummary}

### Beaches
${beachSummary}

### Winter Events (Nov to Mar)
${winterEvents.map((e) => `- ${e.name} (${e.month}): ${e.description.slice(0, 100)}`).join("\n")}

### Local Secret Gems
${secretGems.map((g) => `- ${g.title} (${g.region}): ${g.body.slice(0, 120)}...`).join("\n")}
${COMBINE_YOUR_DAY}
${WINTER_INSIDER_TIPS}`;
  }

  return buildAIContext();
}
