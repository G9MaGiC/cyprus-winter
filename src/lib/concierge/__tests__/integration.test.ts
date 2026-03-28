import { describe, it, expect } from "vitest";
import { orchestrate } from "../orchestrator";
import { parseResponse } from "../response-parser";
import type { ConciergeContext } from "../types";

describe("concierge integration", () => {
  const ctx: ConciergeContext = {
    locale: "en",
    season: "winter",
    path: "/discover",
  };

  it("orchestrator produces a valid system prompt with tool data for discover intent", () => {
    const result = orchestrate("Best villages near Paphos", ctx);

    expect(result.intents).toContain("discover");
    expect(result.systemPrompt).toContain("Cyprus Winter");
    expect(result.systemPrompt).toContain("---ACTIONS---"); // developer policy mentions the format
    expect(result.contextBlock).toContain("search_places");
  });

  it("response parser correctly handles a well-formed response", () => {
    const mockLLMResponse = `Omodos is a beautiful village in the Troodos foothills.

---ACTIONS---
{"cards":[{"type":"place","id":"omodos","title":"Omodos","reason":"Wine village with character"}],"actions":[{"type":"open_place","label":"See Omodos","payload":{"path":"/discover/omodos"}}],"followUps":["Add a winery stop","Plan a day trip"]}`;

    const parsed = parseResponse(mockLLMResponse);
    expect(parsed.prose).toBe("Omodos is a beautiful village in the Troodos foothills.");
    expect(parsed.metadata?.cards).toHaveLength(1);
    expect(parsed.metadata?.actions).toHaveLength(1);
    expect(parsed.metadata?.followUps).toHaveLength(2);
  });

  it("orchestrator handles nearby intent with location", () => {
    const nearbyCtx: ConciergeContext = {
      ...ctx,
      currentLocation: { lat: 34.68, lng: 33.04 },
    };
    const result = orchestrate("What's near me?", nearbyCtx);
    expect(result.intents).toContain("nearby");
    expect(result.toolResults.some((t) => t.tool === "get_nearby_places")).toBe(true);
  });

  it("orchestrator handles airport arrival intent", () => {
    const result = orchestrate("I just arrived at Larnaca airport", ctx);
    expect(result.intents).toContain("airport_arrival");
    expect(result.toolResults.some((t) => t.tool === "get_transport_options")).toBe(true);
  });

  it("all tool results are JSON-serializable", () => {
    const result = orchestrate("Plan 3 days in Limassol", ctx);
    for (const tr of result.toolResults) {
      expect(() => JSON.stringify(tr.data)).not.toThrow();
    }
  });
});
