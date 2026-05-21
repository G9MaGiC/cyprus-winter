import { describe, expect, it } from "vitest";
import {
  sanitizeResponseMetadata,
  sanitizeStoredChatMessages,
} from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops malformed metadata shapes instead of preserving values that crash renderers", () => {
    expect(
      sanitizeResponseMetadata({
        cards: "omodos",
        actions: { type: "open_place", label: "Open" },
        followUps: "Add a winery stop",
      })
    ).toEqual({});
  });

  it("keeps valid metadata and normalizes unsafe action payload paths", () => {
    expect(
      sanitizeResponseMetadata({
        cards: [
          { type: "winery", id: "omodos", title: "Omodos", reason: "Commandaria village" },
          { type: "trail", id: "", title: "No id", reason: "Invalid" },
        ],
        actions: [
          { type: "open_place", label: "External", payload: { path: "https://evil.test" } },
          { type: "open_place", label: "Open Omodos", payload: { path: "/de/discover/omodos" } },
        ],
        followUps: ["Add a winery stop", "", 42],
      })
    ).toEqual({
      cards: [{ type: "winery", id: "omodos", title: "Omodos", reason: "Commandaria village" }],
      actions: [
        { type: "open_place", label: "External" },
        { type: "open_place", label: "Open Omodos", payload: { path: "/discover/omodos" } },
      ],
      followUps: ["Add a winery stop"],
    });
  });
});

describe("sanitizeStoredChatMessages", () => {
  it("removes malformed persisted metadata from otherwise valid chat messages", () => {
    expect(
      sanitizeStoredChatMessages([
        { role: "user", content: "hello" },
        { role: "assistant", content: "Try this", metadata: { followUps: "not an array" } },
        { role: "assistant", content: 123 },
      ])
    ).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: "Try this" },
    ]);
  });
});
