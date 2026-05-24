import { describe, expect, it } from "vitest";
import { filterEventsByRegion } from "./regions";

const events = [
  { id: "all-island", region: "All" },
  { id: "agia-napa", region: "Ayia Napa" },
  { id: "protaras", region: "Protaras" },
  { id: "limassol", region: "Limassol" },
];

describe("filterEventsByRegion", () => {
  it("includes Ayia Napa, Protaras, and island-wide events for the east coast region", () => {
    expect(filterEventsByRegion(events, "ayia-napa").map((event) => event.id)).toEqual([
      "all-island",
      "agia-napa",
      "protaras",
    ]);
  });

  it("includes island-wide events with district-specific events", () => {
    expect(filterEventsByRegion(events, "limassol").map((event) => event.id)).toEqual([
      "all-island",
      "limassol",
    ]);
  });
});
