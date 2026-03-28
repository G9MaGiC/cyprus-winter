import { describe, it, expect } from "vitest";
import { searchEvents } from "../tools/search-events";
import { getWeather } from "../tools/get-weather";
import { getNearbyPlaces } from "../tools/get-nearby-places";
import { getTransportOptions } from "../tools/get-transport-options";

describe("searchEvents", () => {
  it("returns events for a given month", () => {
    const results = searchEvents({ month: "Dec" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((e) => e.month === "Dec")).toBe(true);
  });

  it("filters by region", () => {
    const results = searchEvents({ region: "Limassol" });
    expect(results.every((e) => e.region.includes("Limassol"))).toBe(true);
  });
});

describe("getWeather", () => {
  it("returns weather for a valid month", () => {
    const result = getWeather({ month: "January" });
    expect(result).toBeDefined();
    expect(result!.month).toBe("January");
    expect(result!.coastMinC).toBe(8);
  });

  it("returns undefined for invalid month", () => {
    expect(getWeather({ month: "July" })).toBeUndefined();
  });
});

describe("getNearbyPlaces", () => {
  it("returns places within radius of a location", () => {
    // Limassol center
    const results = getNearbyPlaces({ lat: 34.68, lng: 33.04, radiusKm: 30 });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array for remote location", () => {
    const results = getNearbyPlaces({ lat: 0, lng: 0, radiusKm: 10 });
    expect(results).toHaveLength(0);
  });
});

describe("getTransportOptions", () => {
  it("returns transport for LCA", () => {
    const result = getTransportOptions({ airportCode: "LCA" });
    expect(result).toBeDefined();
    expect(result!.transport.length).toBeGreaterThan(0);
  });

  it("returns transport for PFO", () => {
    const result = getTransportOptions({ airportCode: "PFO" });
    expect(result).toBeDefined();
  });

  it("returns undefined for unknown airport", () => {
    expect(getTransportOptions({ airportCode: "XXX" })).toBeUndefined();
  });
});
