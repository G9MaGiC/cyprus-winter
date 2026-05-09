import { describe, it, expect } from "vitest";
import { rankPlaces, type RankablePlace } from "../ranking";

describe("rankPlaces", () => {
  const places: RankablePlace[] = [
    {
      id: "omodos",
      name: "Omodos",
      region: "Limassol",
      description: "Traditional wine village",
      seasonTags: ["winter"],
      editorialPriority: 1,
      latitude: 34.85,
      longitude: 32.81,
    },
    {
      id: "nissi-beach",
      name: "Nissi Beach",
      region: "Ayia Napa",
      description: "White sand beach",
      seasonTags: ["summer"],
      editorialPriority: 3,
      latitude: 34.987,
      longitude: 34.001,
    },
  ];

  it("ranks winter-suitable places higher in winter", () => {
    const ranked = rankPlaces(places, { query: "village", season: "winter" });
    expect(ranked[0].id).toBe("omodos");
  });

  it("ranks by keyword match", () => {
    const ranked = rankPlaces(places, { query: "beach" });
    expect(ranked[0].id).toBe("nissi-beach");
  });

  it("ranks by distance when location provided", () => {
    // Location near Omodos (Limassol)
    const ranked = rankPlaces(places, {
      query: "",
      userLocation: { lat: 34.68, lng: 33.04 },
    });
    expect(ranked[0].id).toBe("omodos");
  });

  it("returns at most limit results", () => {
    const ranked = rankPlaces(places, { query: "", limit: 1 });
    expect(ranked).toHaveLength(1);
  });
});
