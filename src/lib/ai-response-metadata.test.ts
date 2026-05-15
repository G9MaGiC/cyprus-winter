import { describe, expect, it } from "vitest";
import { sanitizeResponseMetadata } from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops non-array metadata fields that would crash chat rendering", () => {
    expect(
      sanitizeResponseMetadata({
        cards: { length: 1 },
        actions: { map: true },
        followUps: "not-an-array",
      })
    ).toBeUndefined();
  });

  it("keeps bounded valid cards, actions, and follow-up chips", () => {
    expect(
      sanitizeResponseMetadata({
        type: "metadata",
        cards: [
          {
            type: "trail",
            id: "artemis-trail",
            title: "Artemis Trail",
            reason: "Good winter conditions",
          },
        ],
        actions: [
          {
            type: "open_place",
            label: "Open trail",
            payload: { path: "/trails/artemis-trail" },
          },
        ],
        followUps: ["Pair it with a village"],
      })
    ).toEqual({
      cards: [
        {
          type: "trail",
          id: "artemis-trail",
          title: "Artemis Trail",
          reason: "Good winter conditions",
        },
      ],
      actions: [
        {
          type: "open_place",
          label: "Open trail",
          payload: { path: "/trails/artemis-trail" },
        },
      ],
      followUps: ["Pair it with a village"],
    });
  });

  it("drops unsafe action paths and invalid card ids", () => {
    expect(
      sanitizeResponseMetadata({
        cards: [
          {
            type: "place",
            id: "../admin",
            title: "Bad",
            reason: "Bad",
          },
        ],
        actions: [
          {
            type: "open_place",
            label: "Open",
            payload: { path: "//evil.example" },
          },
        ],
      })
    ).toEqual({
      actions: [{ type: "open_place", label: "Open" }],
    });
  });
});
