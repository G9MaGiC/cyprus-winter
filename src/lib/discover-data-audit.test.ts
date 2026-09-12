import { describe, expect, it } from "vitest";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { activityPlaces } from "@/data/activity-places";
import { allDiscoverIds, allDiscoverItems } from "@/data/discover";
import { allPlaces } from "@/data";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { secretGems } from "@/data/secret-gems";
import { WINE_ROUTES } from "@/data/wine-routes";
import { winterEvents } from "@/data/events";
import {
  ACTIVITY_PLACE_IDS,
  ACTIVITY_TRAIL_IDS,
} from "@/lib/activity-catalog";

export const CYPRUS_LAT = { min: 34.5, max: 35.75 };
export const CYPRUS_LNG = { min: 32.2, max: 34.65 };

type GeoItem = { id: string; latitude?: number; longitude?: number };

type CombineItem = { id: string; combineWith?: string[] };

export function buildValidReferenceIds(): Set<string> {
  return new Set([
    ...allDiscoverIds,
    ...allPlaces.map((p) => p.id),
    ...trails.map((t) => t.id),
    ...trails.map((t) => t.slug).filter(Boolean),
  ]);
}

export function collectCombineIssues(
  items: CombineItem[],
  validIds: Set<string>
): string[] {
  const issues: string[] = [];
  for (const item of items) {
    for (const ref of item.combineWith ?? []) {
      if (!validIds.has(ref)) {
        issues.push(`${item.id} combineWith → ${ref}`);
      }
    }
  }
  return issues;
}

export function collectCoordIssues(items: GeoItem[]): string[] {
  const issues: string[] = [];
  for (const item of items) {
    if (item.latitude == null || item.longitude == null) continue;
    if (
      item.latitude < CYPRUS_LAT.min ||
      item.latitude > CYPRUS_LAT.max ||
      item.longitude < CYPRUS_LNG.min ||
      item.longitude > CYPRUS_LNG.max
    ) {
      issues.push(
        `${item.id} coords ${item.latitude},${item.longitude} out of bounds`
      );
    }
  }
  return issues;
}

const allAttractions = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...monasteries,
  ...activityPlaces,
];

const combineSources: CombineItem[] = [
  ...allAttractions,
  ...wineries,
  ...restaurants,
  ...trails,
];

const geoSources: GeoItem[] = [
  ...allAttractions,
  ...wineries,
  ...restaurants,
];

describe("discover data audit — all sources", () => {
  const validIds = buildValidReferenceIds();

  it("has no duplicate discover IDs", () => {
    const seen = new Map<string, number>();
    for (const item of allDiscoverItems) {
      seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, n]) => n > 1);
    expect(dupes, dupes.map(([id]) => id).join(", ")).toEqual([]);
  });

  it("has unique allPlaces IDs so plan add cannot collapse two entities", () => {
    const byId = new Map<string, string[]>();
    for (const place of allPlaces) {
      const labels = byId.get(place.id) ?? [];
      labels.push(`${place.type}:${place.name}`);
      byId.set(place.id, labels);
    }
    const dupes = [...byId.entries()].filter(([, labels]) => labels.length > 1);
    expect(
      dupes,
      dupes.map(([id, labels]) => `${id} → ${labels.join(" | ")}`).join("\n")
    ).toEqual([]);
  });

  it("resolves all combineWith across attractions, wineries, restaurants, trails", () => {
    const issues = collectCombineIssues(combineSources, validIds);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("keeps coordinates within Cyprus bounds", () => {
    const issues = collectCoordIssues(geoSources);
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("resolves secret gem placeId references", () => {
    const issues: string[] = [];
    for (const gem of secretGems) {
      if (gem.placeId && !validIds.has(gem.placeId)) {
        issues.push(`secret-gem ${gem.id} placeId → ${gem.placeId}`);
      }
    }
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("resolves activity catalog place IDs", () => {
    const ids = new Set(allDiscoverIds);
    const issues: string[] = [];
    for (const key of Object.keys(ACTIVITY_PLACE_IDS) as Array<
      keyof typeof ACTIVITY_PLACE_IDS
    >) {
      for (const placeId of ACTIVITY_PLACE_IDS[key]) {
        if (!ids.has(placeId)) issues.push(`${key}: ${placeId}`);
      }
    }
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("resolves activity catalog trail IDs", () => {
    const trailIds = new Set(trails.map((t) => t.id));
    const issues: string[] = [];
    for (const key of Object.keys(ACTIVITY_TRAIL_IDS) as Array<
      keyof typeof ACTIVITY_TRAIL_IDS
    >) {
      for (const trailId of ACTIVITY_TRAIL_IDS[key]) {
        if (!trailIds.has(trailId)) issues.push(`${key} trail: ${trailId}`);
      }
    }
    expect(issues, issues.join("\n")).toEqual([]);
  });
});

describe("discover data audit — per source", () => {
  const validIds = buildValidReferenceIds();

  it("attractions: coords and combineWith", () => {
    const issues = [
      ...collectCoordIssues(allAttractions),
      ...collectCombineIssues(allAttractions, validIds),
    ];
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("wineries: coords and combineWith", () => {
    const issues = [
      ...collectCoordIssues(wineries),
      ...collectCombineIssues(wineries, validIds),
    ];
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("restaurants: coords and combineWith", () => {
    const issues = [
      ...collectCoordIssues(restaurants),
      ...collectCombineIssues(restaurants, validIds),
    ];
    expect(issues, issues.join("\n")).toEqual([]);
  });

  it("trails: coords and combineWith", () => {
    const issues = [
      ...collectCoordIssues(trails),
      ...collectCombineIssues(trails, validIds),
    ];
    expect(issues, issues.join("\n")).toEqual([]);
  });
});

describe("discover data audit — factual anchors (wineries & trails)", () => {
  it("Kakopetria restaurant does not claim UNESCO old town", () => {
    const kakopetria = restaurants.find((r) => r.id === "kakopetria-trout");
    expect(kakopetria?.localSecret).not.toMatch(/Old Town is UNESCO/);
    expect(kakopetria?.localSecret).toMatch(/Galata/);
  });

  // The per-record wine-route zone anchors (savvas → Commandaria, komos →
  // Krasochoria) retired with the 2026-09-02 quarantine — both records left
  // the public catalog (docs/PARTNER_DATA_VERIFICATION_2026-09-02.md) but stay
  // in source history with their corrections. Zone correctness on public
  // records is covered generically by the route-page match guard above.
});

describe("discover data audit — wine routes & events", () => {
  it("Commandaria route names UNESCO villages, not Omodos", () => {
    const cmd = WINE_ROUTES.find((r) => r.slug === "commandaria");
    expect(cmd?.description).toMatch(/fourteen UNESCO/i);
    expect(cmd?.description).toMatch(/Not Omodos/i);
  });

  it("Commandaria festival event references UNESCO villages", () => {
    const fest = winterEvents.find((e) => e.id === "commandaria-festival");
    expect(fest?.description).toMatch(/Silikou|Louvaras|Doros|Monagri/);
    expect(fest?.venue).not.toMatch(/Pera Pedi only/i);
  });

  it("Bellapais event notes north Cyprus access", () => {
    const bell = winterEvents.find((e) => e.id === "bellapais-concerts");
    expect(bell?.description).toMatch(/north Cyprus|border/i);
    expect(bell?.description?.slice(0, 80)).toMatch(/north Cyprus|border/i);
  });

  it("wineries avoid bare daily hours without off-season note", async () => {
    const { wineries } = await import("@/data/wineries");
    const bareDaily = wineries.filter(
      (w) =>
        w.openingHours?.match(/\bdaily\b/i) &&
        !w.openingHours?.match(/call ahead|appointment|Nov–Mar|in season/i)
    );
    expect(bareDaily.map((w) => w.id)).toEqual([]);
  });
});

describe("discover data audit — factual anchors (activity)", () => {
  it("Gerakopetra is Paphos Laona, not Limassol", () => {
    const g = activityPlaces.find((p) => p.id === "gerakopetra-boulders");
    expect(g?.region).toBe("Paphos");
  });

  it("Lady's Mile does not combineWith Larnaca salt lake trail", () => {
    const l = activityPlaces.find((p) => p.id === "lady-mile-windsurf");
    expect(l?.combineWith).not.toContain("larnaca-salt-lake");
  });

  it("gap-fill: Larnaca watersports (Mackenzie) and cycling loop", () => {
    expect(activityPlaces.find((p) => p.id === "mackenzie-larnaca-coast")?.region).toBe(
      "Larnaca"
    );
    const cycle = activityPlaces.find((p) => p.id === "larnaca-village-coastal-cycle");
    expect(cycle?.combineWith).toContain("kalavasos");
    expect(cycle?.combineWith).toContain("zygi-tavernas");
  });

  it("gap-fill: east-corridor bouldering and Nicosia wellness", () => {
    const boulders = activityPlaces.find((p) => p.id === "eptagoneia-limestone-boulders");
    expect(boulders?.combineWith).toContain("klirou-boulders");
    expect(boulders?.combineWith).toContain("arakapas-boulders");
    expect(activityPlaces.find((p) => p.id === "athalassa-forest-park")?.region).toBe(
      "Nicosia"
    );
  });

  it("Droushia boulders and village avoid unverified pottery claims", () => {
    const boulders = activityPlaces.find((p) => p.id === "droushia-konefti-boulders");
    expect(boulders?.backstory).not.toMatch(/Doros Heraclidou|since 1975/);
    expect(boulders?.backstory).toMatch(/weaving|Rural Life/i);
    const village = villages.find((v) => v.id === "droushia");
    expect(village?.highlights).not.toContain("Pottery workshop");
    expect(village?.winterTip).not.toMatch(/potter/i);
  });

  it("Arakapas boulders region is Pitsilia", () => {
    expect(activityPlaces.find((p) => p.id === "arakapas-boulders")?.region).toBe(
      "Pitsilia"
    );
  });

  it("Buffavento notes north Cyprus access in description", () => {
    const b = ancientSites.find((a) => a.id === "buffavento");
    expect(b?.description).toMatch(/north Cyprus/i);
    expect(b?.winterTip).toMatch(/border/i);
  });

  it("uses Department of Antiquities / DMT hours and access, not invented daily gates", () => {
    const choiro = ancientSites.find((a) => a.id === "choirokoitia");
    expect(choiro?.openingHours).toMatch(/Daily 8:30 to 17:00 \(winter/);
    expect(choiro?.openingHours).not.toMatch(/closed Mon/i);
    expect(choiro?.accessibility).toMatch(/reconstructed dwellings/i);
    expect(choiro?.accessibility).toMatch(/not for limited mobility/i);

    const palaipafos = ancientSites.find((a) => a.id === "palaipafos");
    expect(palaipafos?.openingHours).toMatch(/closed Mon/i);

    const kition = ancientSites.find((a) => a.id === "kition");
    expect(kition?.openingHours).toMatch(/Mon to Fri 8:30 to 16:00/);
    expect(kition?.openingHours).toMatch(/Closed Sat and Sun/);
    expect(kition?.accessibility).toMatch(/Wheelchair accessible/i);

    const kourion = ancientSites.find((a) => a.id === "kourion");
    expect(kourion?.accessibility).toMatch(/wheelchair accessible/i);

    const asinou = monasteries.find((m) => m.id === "panagia-asinou");
    expect(asinou?.openingHours).toMatch(/16 Sep to 15 Apr/);
    expect(asinou?.accessibility).toMatch(/Wheelchair accessible/i);

    const aliki = natureSites.find((n) => n.id === "larnaca-aliki");
    expect(aliki?.bestFor).toEqual(expect.arrayContaining(["Families", "Gentle walks"]));
    expect(aliki?.accessibility).toMatch(/Paved paths/);
  });

  it("Climb Cyprus indoor gym uses activity type", () => {
    expect(activityPlaces.find((p) => p.id === "climb-cyprus-limassol")?.type).toBe(
      "activity"
    );
  });

  it("watersports uses canonical lara-bay not shadow duplicate", () => {
    expect(allDiscoverIds).not.toContain("lara-akamas-shores");
    expect(ACTIVITY_PLACE_IDS.watersports).toContain("lara-bay");
    expect(ACTIVITY_PLACE_IDS.watersports).not.toContain("governors-beach");
  });

  it("hidden-gem copy implies Off-the-beaten-path bestFor tag (BUG-230)", () => {
    const ids = [
      "salamis",
      "palaipafos",
      "buffavento",
      "panagia-tou-araka",
      "ayii-anargyri",
      "silikou-museum",
      "lady-mile-windsurf",
      "larnaca-village-coastal-cycle",
      "louvaras",
      "kato-platres",
      "hadjicharalambous",
      "papaioannou",
      "latsi-harbour",
      "pissouri-tavernas",
      "pera-pedi",
      "lefkara-kato",
      "kato-drys",
      "monolithos",
    ] as const;
    for (const id of ids) {
      const item = allDiscoverItems.find((p) => p.id === id);
      expect(item, id).toBeDefined();
      expect(item!.bestFor, id).toEqual(
        expect.arrayContaining(["Off-the-beaten-path"])
      );
    }
  });
});

describe("discover data audit — Troodos trail pacing", () => {
  it("Artemis and Atalante combineWith avoid same-day Chionistra doubles", () => {
    const artemis = trails.find((t) => t.id === "artemis");
    const atalante = trails.find((t) => t.id === "atalante");
    expect(artemis?.combineWith).toBeDefined();
    expect(atalante?.combineWith).toBeDefined();
    expect(artemis!.combineWith).not.toContain("atalante");
    expect(atalante!.combineWith).not.toContain("artemis");
    expect(atalante!.combineWith).not.toContain("omodos");
    expect(atalante!.combineWith).not.toContain("tsiakkas");
  });

  it("no trail combineWith lists both Artemis and Atalante", () => {
    const offenders = trails.filter(
      (t) =>
        t.combineWith?.includes("artemis") && t.combineWith?.includes("atalante")
    );
    expect(offenders.map((t) => t.id)).toEqual([]);
  });

  it("full-day Almirolivado does not pair with Chionistra loop trails", () => {
    const almirolivado = trails.find((t) => t.id === "almirolivado");
    expect(almirolivado?.combineWith).not.toContain("artemis");
    expect(almirolivado?.combineWith).not.toContain("atalante");
  });
});
