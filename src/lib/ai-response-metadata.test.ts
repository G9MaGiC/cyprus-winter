import { describe, expect, it } from "vitest";
import {
  sanitizeResponseMetadata,
  sanitizeStoredChatMessages,
  type StoredChatMessage,
} from "./ai-response-metadata";

describe("AI response metadata sanitization", () => {
  it("drops malformed metadata collections so chat renderers never receive non-arrays", () => {
    const metadata = sanitizeResponseMetadata({
      cards: "not cards",
      actions: { label: "Open" },
      followUps: "not chips",
    });

    expect(metadata).toEqual({});
  });

  it("keeps only render-safe cards, actions, and follow-up chips", () => {
    const metadata = sanitizeResponseMetadata({
      cards: [
        { type: "trail", id: "artemis", title: "Artemis", reason: "Snowline views" },
        { type: "trail", id: "", title: "Missing id", reason: "Bad" },
      ],
      actions: [
        { type: "open_place", label: "Open", payload: { path: "/en/discover/kourion" } },
        { type: "open_place", label: "", payload: { path: "https://evil.example" } },
      ],
      followUps: ["Nearby wine", "", 42],
    });

    expect(metadata).toEqual({
      cards: [{ type: "trail", id: "artemis", title: "Artemis", reason: "Snowline views" }],
      actions: [{ type: "open_place", label: "Open", payload: { path: "/discover/kourion" } }],
      followUps: ["Nearby wine"],
    });
  });

  it("sanitizes persisted chat messages before hydrating client state", () => {
    const messages = sanitizeStoredChatMessages([
      {
        role: "assistant",
        content: "Pick a route",
        metadata: { actions: "bad", followUps: ["Omodos"] },
      },
      {
        role: "assistant",
        content: "Open it",
        metadata: { cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "Village" }] },
      },
      { role: "system", content: "ignore me", metadata: { followUps: ["bad"] } },
    ] satisfies Array<StoredChatMessage | Record<string, unknown>>);

    expect(messages).toEqual([
      { role: "assistant", content: "Pick a route", metadata: { followUps: ["Omodos"] } },
      {
        role: "assistant",
        content: "Open it",
        metadata: { cards: [{ type: "place", id: "omodos", title: "Omodos", reason: "Village" }] },
      },
    ]);
  });
});
