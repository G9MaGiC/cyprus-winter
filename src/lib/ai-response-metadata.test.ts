import { describe, expect, it } from "vitest";
import { sanitizeResponseMetadata } from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops malformed metadata arrays that would crash chat renderers", () => {
    expect(
      sanitizeResponseMetadata({
        cards: "not-an-array",
        actions: "not-an-array",
        followUps: "not-an-array",
      })
    ).toBeUndefined();
  });

  it("keeps valid bounded metadata and normalizes localized internal action paths", () => {
    expect(
      sanitizeResponseMetadata({
        cards: [
          { type: "place", id: "omodos", title: "Omodos", reason: "Wine village" },
          { type: "place", id: "missing-place", title: "Missing", reason: "Nope" },
        ],
        actions: [
          { type: "open_place", label: "See Omodos", payload: { path: "/en/discover/omodos" } },
          { type: "open_place", label: "External", payload: { path: "//evil.example" } },
        ],
        followUps: ["Add a winery stop", 42, ""],
      })
    ).toEqual({
      cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "Wine village" }],
      actions: [
        { type: "open_place", label: "See Omodos", payload: { path: "/discover/omodos" } },
        { type: "open_place", label: "External" },
      ],
      followUps: ["Add a winery stop"],
    });
  });
});
