import { describe, it, expect } from "vitest";
import type { Intent, ConciergeContext, OnboardingIntent, ResponseMetadata } from "../types";

describe("concierge types", () => {
  it("allows valid intent values", () => {
    const intent: Intent = "discover";
    expect(intent).toBe("discover");
  });

  it("allows valid context shape", () => {
    const ctx: ConciergeContext = {
      locale: "en",
      season: "winter",
      path: "/trails",
    };
    expect(ctx.season).toBe("winter");
  });

  it("allows context with onboarding intent", () => {
    const intent: OnboardingIntent = "planning";
    const ctx: ConciergeContext = {
      locale: "en",
      season: "winter",
      userOnboardingIntent: intent,
    };
    expect(ctx.userOnboardingIntent).toBe("planning");
  });

  it("allows valid response metadata shape", () => {
    const meta: ResponseMetadata = {
      cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "quiet village" }],
      actions: [{ type: "open_place", label: "See Omodos" }],
      followUps: ["Add a winery stop"],
    };
    expect(meta.cards).toHaveLength(1);
  });
});
