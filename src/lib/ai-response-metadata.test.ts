import { describe, expect, it } from "vitest";
import {
  sanitizeResponseMetadata,
  sanitizeStoredChatMessages,
} from "@/lib/ai-response-metadata";

describe("AI response metadata sanitization", () => {
  it("drops malformed metadata shapes that would crash chat rendering", () => {
    const sanitized = sanitizeResponseMetadata({
      cards: { length: 1 },
      actions: [
        {
          type: "open_place",
          label: { text: "Open" },
          payload: { path: "/discover/kourion" },
        },
        {
          type: "open_place",
          label: "Open Kourion",
          payload: { path: "/en/discover/kourion" },
        },
      ],
      followUps: "Plan my day",
    });

    expect(sanitized.cards).toBeUndefined();
    expect(sanitized.followUps).toBeUndefined();
    expect(sanitized.actions).toEqual([
      {
        type: "open_place",
        label: "Open Kourion",
        payload: { path: "/discover/kourion" },
      },
    ]);
  });

  it("sanitizes persisted chat session metadata before rendering", () => {
    const sanitized = sanitizeStoredChatMessages([
      {
        role: "assistant",
        content: "Try this",
        metadata: {
          cards: { length: 1 },
          actions: [{ type: "book_now", label: "Book", payload: { path: "https://evil.example" } }],
          followUps: ["A", 42, "B"],
        },
      },
      { role: "user", content: "thanks", metadata: { followUps: ["ignored"] } },
      { role: "assistant", content: 42 },
    ]);

    expect(sanitized).toEqual([
      {
        role: "assistant",
        content: "Try this",
        metadata: {
          actions: [{ type: "book_now", label: "Book", payload: { path: "/discover" } }],
          followUps: ["A", "B"],
        },
      },
      { role: "user", content: "thanks" },
    ]);
  });

  it("drops cards with unsafe path-like IDs", () => {
    const sanitized = sanitizeResponseMetadata({
      cards: [
        { type: "place", id: "../admin", title: "Admin", reason: "bad" },
        { type: "place", id: "kourion?next=/admin", title: "Kourion", reason: "bad" },
        { type: "trail", id: "artemis", title: "Artemis", reason: "safe" },
      ],
    });

    expect(sanitized.cards).toEqual([
      { type: "trail", id: "artemis", title: "Artemis", reason: "safe" },
    ]);
  });
});
