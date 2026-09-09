import { describe, expect, it } from "vitest";
import {
  activeMapPinKinds,
  buildDiscoverMapPlaces,
  buildDiscoverMapPlacesFromSections,
  buildTrailMapPlaces,
  resolveDiscoverMapKind,
} from "@/lib/discover-map-places";
import type { DiscoverSection } from "@/lib/discover-sections";
import { getPlaceById } from "@/data";

describe("resolveDiscoverMapKind", () => {
  it("maps winery plan type to winery kind", () => {
    const place = getPlaceById("tsiakkas");
    expect(place?.type).toBe("winery");
    expect(resolveDiscoverMapKind(place!)).toBe("winery");
  });

  it("maps village attraction to village kind", () => {
    const place = getPlaceById("omodos");
    expect(place?.type).toBe("attraction");
    expect(resolveDiscoverMapKind(place!)).toBe("village");
  });
});

describe("buildDiscoverMapPlaces", () => {
  it("assigns kind on every place", () => {
    const places = buildDiscoverMapPlaces(["omodos", "tsiakkas"]);
    expect(places).toHaveLength(2);
    expect(places.every((p) => p.kind)).toBe(true);
    expect(places.find((p) => p.id === "omodos")?.kind).toBe("village");
    expect(places.find((p) => p.id === "tsiakkas")?.kind).toBe("winery");
  });

  it("carries nameEl through the projection so popups can localize (b82)", () => {
    const omodos = buildDiscoverMapPlaces(["omodos"])[0];
    expect(omodos.nameEl).toBe("Όμοδος");
    const capeGreco = buildTrailMapPlaces(["cape-greco"])[0];
    expect(capeGreco.nameEl).toBe("Ακρωτήρι Γκρέκο");
  });
});

describe("buildTrailMapPlaces", () => {
  it("builds trail markers with trail kind", () => {
    const places = buildTrailMapPlaces(["artemis"]);
    expect(places).toHaveLength(1);
    expect(places[0].kind).toBe("trail");
    expect(places[0].href).toBe("/trails/artemis");
  });
});

describe("buildDiscoverMapPlacesFromSections", () => {
  it("merges trailLinks when activity filter", () => {
    const section: DiscoverSection = {
      id: "bouldering",
      title: "Bouldering",
      items: [],
      trailLinks: [{ id: "smigies", name: "Smigies", href: "/trails/smigies" }],
    };
    const places = buildDiscoverMapPlacesFromSections([section], {
      includeTrailLinks: true,
    });
    expect(places.some((p) => p.id === "smigies" && p.kind === "trail")).toBe(true);
  });

  it("skips trailLinks when not activity filter", () => {
    const section: DiscoverSection = {
      id: "bouldering",
      title: "Bouldering",
      items: [],
      trailLinks: [{ id: "smigies", name: "Smigies", href: "/trails/smigies" }],
    };
    const places = buildDiscoverMapPlacesFromSections([section]);
    expect(places.some((p) => p.id === "smigies")).toBe(false);
  });
});

describe("activeMapPinKinds", () => {
  it("returns kinds in stable order", () => {
    const kinds = activeMapPinKinds([
      { id: "a", name: "A", href: "/", region: "L", lat: 1, lng: 1, kind: "trail" },
      { id: "b", name: "B", href: "/", region: "L", lat: 1, lng: 1, kind: "winery" },
    ]);
    expect(kinds).toEqual(["winery", "trail"]);
  });
});
