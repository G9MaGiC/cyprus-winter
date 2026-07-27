import { describe, expect, it } from "vitest";
import { sanitizeResponseMetadata } from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops non-string metadata fields that would crash chat rendering", () => {
    const sanitized = sanitizeResponseMetadata({
      cards: [
        { type: "place", id: "omodos", title: "Omodos", reason: "Wine village" },
        { type: "place", id: "bad", title: { text: "Bad" }, reason: "Invalid title" },
      ],
      actions: [
        { type: "open_place", label: "Open Omodos", payload: { path: "/discover/omodos" } },
        { type: "open_place", label: ["not renderable"], payload: { path: "/discover/kourion" } },
      ],
      followUps: ["Add a winery stop", { text: "not renderable" }],
    });

    expect(sanitized).toEqual({
      cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "Wine village" }],
      actions: [{ type: "open_place", label: "Open Omodos", payload: { path: "/discover/omodos" } }],
      followUps: ["Add a winery stop"],
    });
  });

  it("omits non-array cards/actions that would crash PlaceCards/ActionButtons.map", () => {
    expect(sanitizeResponseMetadata({ cards: "abc", actions: "x", followUps: "y" })).toEqual({});
  });
});
