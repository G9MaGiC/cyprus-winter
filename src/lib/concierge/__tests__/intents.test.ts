import { describe, it, expect } from "vitest";
import { classifyIntent } from "../intents";
import type { ConciergeContext } from "../types";

const baseCtx: ConciergeContext = { locale: "en", season: "winter" };

describe("classifyIntent", () => {
  it("classifies 'plan 3 days in Cyprus' as plan_trip", () => {
    expect(classifyIntent("Plan 3 days in Cyprus", baseCtx)).toContain("plan_trip");
  });

  it("classifies 'what should I do today' as plan_today", () => {
    expect(classifyIntent("What should I do today?", baseCtx)).toContain("plan_today");
  });

  it("classifies 'best villages near Paphos' as discover", () => {
    expect(classifyIntent("Best villages near Paphos", baseCtx)).toContain("discover");
  });

  it("classifies 'it's raining' as weather_adapted", () => {
    expect(classifyIntent("It's raining, what can we do?", baseCtx)).toContain("weather_adapted");
  });

  it("classifies 'what's near me' as nearby", () => {
    expect(classifyIntent("What's near me?", baseCtx)).toContain("nearby");
  });

  it("classifies 'book a winery' as booking", () => {
    expect(classifyIntent("Book a winery for tomorrow", baseCtx)).toContain("booking");
  });

  it("classifies 'easy winter hike' as trails_outdoor", () => {
    expect(classifyIntent("Easy winter hike", baseCtx)).toContain("trails_outdoor");
  });

  it("classifies 'I just landed' as airport_arrival", () => {
    expect(classifyIntent("I just landed in Larnaca", baseCtx)).toContain("airport_arrival");
  });

  it("classifies 'Ayia Napa or Paphos?' as search_compare", () => {
    expect(classifyIntent("Ayia Napa or Paphos in winter?", baseCtx)).toContain("search_compare");
  });

  it("classifies 'where do I save this' as account_navigation", () => {
    expect(classifyIntent("Where do I save this?", baseCtx)).toContain("account_navigation");
  });

  it("falls back to general for unrecognized input", () => {
    expect(classifyIntent("Hello", baseCtx)).toContain("general");
  });

  it("can return multiple intents", () => {
    const intents = classifyIntent("Plan a rainy day in Limassol", baseCtx);
    expect(intents).toContain("plan_today");
    expect(intents).toContain("weather_adapted");
  });
});
