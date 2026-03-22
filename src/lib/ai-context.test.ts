import { describe, it, expect } from "vitest";
import { buildAIContext, buildAIContextRelevant } from "./ai-context";

describe("buildAIContext", () => {
  it("returns a string containing Cyprus Winter knowledge base", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Cyprus Winter App Knowledge Base");
  });

  it("includes hiking trails section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Hiking Trails");
  });

  it("includes wineries section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Wineries");
  });

  it("includes ancient sites section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Ancient Sites");
  });

  it("includes villages section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Villages");
  });

  it("includes monasteries section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Monasteries");
  });

  it("includes beaches section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Beaches");
  });

  it("includes winter events section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Winter Events");
  });

  it("includes winter essentials", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Winter Essentials");
  });

  it("includes secret gems section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Local Secret Gems");
  });

  it("includes combine your day section", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("Combine Your Day");
  });

  it("includes link format instructions", () => {
    const ctx = buildAIContext();
    expect(ctx).toContain("/trails/");
    expect(ctx).toContain("/discover/");
  });
});

describe("buildAIContextRelevant", () => {
  it("returns trails-focused context for /trails paths", () => {
    const ctx = buildAIContextRelevant({ path: "/trails/artemis" });
    expect(ctx).toContain("Hiking Trails");
    expect(ctx).toContain("Villages (near trails)");
    expect(ctx).toContain("Wineries (pair with trails)");
  });

  it("returns discover-focused context for /discover paths", () => {
    const ctx = buildAIContextRelevant({ path: "/discover/something" });
    expect(ctx).toContain("Ancient Sites");
    expect(ctx).toContain("Villages");
    expect(ctx).toContain("Wineries");
    expect(ctx).toContain("Hiking Trails");
  });

  it("returns discover-focused context for /book/winery paths", () => {
    const ctx = buildAIContextRelevant({ path: "/book/winery/test" });
    expect(ctx).toContain("Ancient Sites");
    expect(ctx).toContain("Wineries");
  });

  it("returns plan-focused context for /plan paths", () => {
    const ctx = buildAIContextRelevant({ path: "/plan" });
    expect(ctx).toContain("Hiking Trails");
    expect(ctx).toContain("Wineries");
    expect(ctx).toContain("Ancient Sites");
    expect(ctx).toContain("Villages");
    expect(ctx).toContain("Monasteries");
    expect(ctx).toContain("Beaches");
    expect(ctx).toContain("Winter Events");
    expect(ctx).toContain("Local Secret Gems");
    expect(ctx).toContain("Winter Insider Tips");
  });

  it("returns plan-focused context when itineraryPlaceIds are provided", () => {
    const ctx = buildAIContextRelevant({ path: "/", itineraryPlaceIds: ["tsiakkas"] });
    expect(ctx).toContain("Local Secret Gems");
    expect(ctx).toContain("Winter Insider Tips");
  });

  it("falls back to full context for unknown paths", () => {
    const ctx = buildAIContextRelevant({ path: "/some-random-page" });
    const full = buildAIContext();
    expect(ctx).toBe(full);
  });

  it("falls back to full context when no options provided", () => {
    const ctx = buildAIContextRelevant();
    const full = buildAIContext();
    expect(ctx).toBe(full);
  });

  it("includes winter insider tips on trails page when focusIds are set", () => {
    const ctx = buildAIContextRelevant({ path: "/trails/artemis", lastPlace: "artemis-trail" });
    expect(ctx).toContain("Winter Insider Tips");
  });

  it("excludes winter insider tips on trails page when no focusIds", () => {
    const ctx = buildAIContextRelevant({ path: "/trails/artemis" });
    expect(ctx).not.toContain("Winter Insider Tips");
  });

  it("includes combine your day on trails page", () => {
    const ctx = buildAIContextRelevant({ path: "/trails/artemis" });
    expect(ctx).toContain("Combine Your Day");
  });

  it("includes combine your day on discover page", () => {
    const ctx = buildAIContextRelevant({ path: "/discover/test" });
    expect(ctx).toContain("Combine Your Day");
  });

  it("includes tier1 essentials for trails page", () => {
    const ctx = buildAIContextRelevant({ path: "/trails/test" });
    expect(ctx).toContain("Cyprus Winter guide");
    expect(ctx).toContain("Emergency: 112");
  });

  it("includes tier1 essentials for discover page", () => {
    const ctx = buildAIContextRelevant({ path: "/discover/test" });
    expect(ctx).toContain("Cyprus Winter guide");
  });
});
