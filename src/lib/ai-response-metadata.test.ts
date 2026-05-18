import { describe, expect, it } from "vitest";
import { sanitizeResponseMetadata, sanitizeStoredChatMessages } from "./ai-response-metadata";

describe("sanitizeResponseMetadata", () => {
  it("drops malformed model metadata before it reaches chat rendering", () => {
    const sanitized = sanitizeResponseMetadata({
      cards: "not-an-array",
      actions: [{ type: "open_place", label: { text: "Omodos" } }],
      followUps: ["Plan a day", 123, ""],
    });

    expect(sanitized).toEqual({ followUps: ["Plan a day"] });
  });

  it("keeps valid cards, actions, and follow-up chips", () => {
    const sanitized = sanitizeResponseMetadata({
      cards: [
        {
          type: "place",
          id: "omodos",
          title: "Omodos",
          reason: "Commandaria village",
        },
      ],
      actions: [
        {
          type: "open_place",
          label: "See Omodos",
          payload: { path: "/discover/omodos" },
        },
      ],
      followUps: ["Add a winery stop"],
    });

    expect(sanitized).toEqual({
      cards: [
        {
          type: "place",
          id: "omodos",
          title: "Omodos",
          reason: "Commandaria village",
        },
      ],
      actions: [
        {
          type: "open_place",
          label: "See Omodos",
          payload: { path: "/discover/omodos" },
        },
      ],
      followUps: ["Add a winery stop"],
    });
  });

  it("removes invalid metadata from persisted chat messages", () => {
    const messages = sanitizeStoredChatMessages([
      { role: "assistant", content: "Hi", metadata: { followUps: "bad" } },
      { role: "assistant", content: "Try this", metadata: { followUps: ["Omodos"] } },
    ]);

    expect(messages).toEqual([
      { role: "assistant", content: "Hi" },
      { role: "assistant", content: "Try this", metadata: { followUps: ["Omodos"] } },
    ]);
  });
});
