import { describe, it, expect } from "vitest";
import { orchestrate } from "../orchestrator";
import type { ConciergeContext } from "../types";

const baseCtx: ConciergeContext = {
  locale: "en",
  season: "winter",
  path: "/discover",
};

describe("orchestrate", () => {
  it("returns intents, tool results, and assembled prompt for a discover query", () => {
    const result = orchestrate("Best villages near Paphos", baseCtx);
    expect(result.intents).toContain("discover");
    expect(result.toolResults.length).toBeGreaterThan(0);
    expect(result.systemPrompt).toContain("Cyprus Winter");
    expect(result.contextBlock).toContain("Retrieved data");
  });

  it("includes weather data for weather-adapted queries", () => {
    const result = orchestrate("It's raining, what can we do?", baseCtx);
    expect(result.intents).toContain("weather_adapted");
    const weatherTool = result.toolResults.find((t) => t.tool === "get_weather");
    expect(weatherTool).toBeDefined();
  });

  it("includes transport data for airport queries", () => {
    const result = orchestrate("I just landed in Larnaca", baseCtx);
    expect(result.intents).toContain("airport_arrival");
    const transportTool = result.toolResults.find((t) => t.tool === "get_transport_options");
    expect(transportTool).toBeDefined();
  });

  it("includes nearby places when location is provided", () => {
    const ctx: ConciergeContext = {
      ...baseCtx,
      currentLocation: { lat: 34.68, lng: 33.04 },
    };
    const result = orchestrate("What's near me?", ctx);
    expect(result.intents).toContain("nearby");
    const nearbyTool = result.toolResults.find((t) => t.tool === "get_nearby_places");
    expect(nearbyTool).toBeDefined();
  });

  it("returns general intent with no tools for greetings", () => {
    const result = orchestrate("Hello!", baseCtx);
    expect(result.intents).toContain("general");
    expect(result.toolResults).toHaveLength(0);
  });
});
