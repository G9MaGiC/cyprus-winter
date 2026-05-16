import { describe, expect, it } from "vitest";
import { sanitizeResponseMetadata, sanitizeStoredChatMessages } from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops shape-invalid metadata that would crash renderers", () => {
    expect(
      sanitizeResponseMetadata({
        cards: "bad",
        actions: { type: "open_place" },
        followUps: "Plan a day",
      })
    ).toBeNull();
  });

  it("keeps valid metadata and removes unsafe action paths", () => {
    expect(
      sanitizeResponseMetadata({
        cards: [
          { type: "trail", id: "artemis", title: "Artemis Trail", reason: "Clear winter loop" },
          { type: "place", id: "", title: "Broken", reason: "Missing id" },
        ],
        actions: [
          { type: "open_place", label: "Open", payload: { path: "/trails/artemis" } },
          { type: "book_now", label: "Bad", payload: { path: "https://evil.example" } },
        ],
        followUps: ["  Pair with a winery  ", 123],
      })
    ).toEqual({
      cards: [
        { type: "trail", id: "artemis", title: "Artemis Trail", reason: "Clear winter loop" },
      ],
      actions: [
        { type: "open_place", label: "Open", payload: { path: "/trails/artemis" } },
        { type: "book_now", label: "Bad" },
      ],
      followUps: ["Pair with a winery"],
    });
  });

  it("normalizes locale-prefixed action paths before locale-aware routing", () => {
    expect(
      sanitizeResponseMetadata({
        actions: [
          { type: "open_place", label: "Open", payload: { path: "/de/discover/omodos" } },
        ],
      })
    ).toEqual({
      actions: [{ type: "open_place", label: "Open", payload: { path: "/discover/omodos" } }],
    });
  });

  it("sanitizes malformed metadata from persisted chat messages", () => {
    expect(
      sanitizeStoredChatMessages([
        {
          role: "assistant",
          content: "Here are ideas",
          metadata: { cards: { length: 1 }, followUps: ["  Try Troodos  "] },
        },
      ])
    ).toEqual([
      {
        role: "assistant",
        content: "Here are ideas",
        metadata: { followUps: ["Try Troodos"] },
      },
    ]);
  });
});
