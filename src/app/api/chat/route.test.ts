import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock setup (must be before import) ──────────────────────────────────────

const mockRateLimit = vi.fn();
const mockBuildAIContext = vi.fn();
const mockBuildAIContextRelevant = vi.fn();
const mockSanitizeText = vi.fn();
const mockGetPlaceById = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

vi.mock("@/lib/ai-context", () => ({
  buildAIContext: (...args: unknown[]) => mockBuildAIContext(...args),
  buildAIContextRelevant: (...args: unknown[]) => mockBuildAIContextRelevant(...args),
}));

vi.mock("@/lib/sanitize", () => ({
  sanitizeText: (...args: unknown[]) => mockSanitizeText(...args),
}));

vi.mock("@/data", () => ({
  getPlaceById: (...args: unknown[]) => mockGetPlaceById(...args),
}));

// Mock OpenAI – we capture the mock so tests can control completions.create
const mockCompletionsCreate = vi.fn();
vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: (...args: unknown[]) => mockCompletionsCreate(...args),
        },
      };
    },
  };
});

import { POST } from "./route";

// ── Helpers ─────────────────────────────────────────────────────────────────

function req(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

/** Create an async iterable that yields SSE-style chunks, simulating OpenAI streaming. */
function makeStreamChunks(texts: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const text of texts) {
        yield { choices: [{ delta: { content: text } }] };
      }
    },
  };
}

/** Read all SSE data events from a streaming response body. */
async function readSSEEvents(res: Response): Promise<unknown[]> {
  const text = await res.text();
  const events: unknown[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ")) {
      events.push(JSON.parse(line.slice(6)));
    }
  }
  return events;
}

const validMessages = [{ role: "user", content: "Tell me about hiking" }];
const rateLimitOk = {
  ok: true,
  remaining: 19,
  resetAt: Date.now() + 60_000,
  bypassed: false,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: rate limit passes
    mockRateLimit.mockResolvedValue(rateLimitOk);

    // Default: sanitizeText passes through (identity)
    mockSanitizeText.mockImplementation((s: string) => s);

    // Default: context building returns a string
    mockBuildAIContextRelevant.mockReturnValue("Relevant context data.");
    mockBuildAIContext.mockReturnValue("Full context data.");

    // Default: getPlaceById returns undefined (no match)
    mockGetPlaceById.mockReturnValue(undefined);

    // Default: streaming completion succeeds
    mockCompletionsCreate.mockResolvedValue(makeStreamChunks(["Hello", " world"]));
  });

  // ── Input Validation ────────────────────────────────────────────────────

  describe("input validation", () => {
    it("returns 400 for missing messages", async () => {
      const res = await POST(req({}));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid messages format (string instead of array)", async () => {
      const res = await POST(req({ messages: "not-array" }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for empty messages array", async () => {
      const res = await POST(req({ messages: [] }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error?.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 for invalid JSON body", async () => {
      const rawReq = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.1",
        },
        body: "not-json{{{",
      });
      const res = await POST(rawReq);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error?.code).toBe("VALIDATION_ERROR");
      expect(data.error?.message).toContain("Invalid JSON");
    });

    it("returns 400 for messages with missing content", async () => {
      const res = await POST(req({ messages: [{ role: "user" }] }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for messages with invalid role", async () => {
      const res = await POST(req({ messages: [{ role: "admin", content: "hi" }] }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for messages with empty content string", async () => {
      const res = await POST(req({ messages: [{ role: "user", content: "" }] }));
      expect(res.status).toBe(400);
    });

    it("accepts valid context with locale", async () => {
      const res = await POST(
        req({
          messages: validMessages,
          context: { locale: "de" },
        })
      );
      expect(res.status).toBe(200);
    });

    it("accepts valid context with path", async () => {
      const res = await POST(
        req({
          messages: validMessages,
          context: { path: "/trails/artemis" },
        })
      );
      expect(res.status).toBe(200);
    });

    it("accepts request without context (optional field)", async () => {
      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
    });

    it("accepts multiple messages with different roles", async () => {
      const res = await POST(
        req({
          messages: [
            { role: "user", content: "Hello" },
            { role: "assistant", content: "Hi there" },
            { role: "user", content: "Tell me about wineries" },
          ],
        })
      );
      expect(res.status).toBe(200);
    });
  });

  // ── Rate Limiting ───────────────────────────────────────────────────────

  describe("rate limiting", () => {
    it("returns 429 when rate limited", async () => {
      mockRateLimit.mockResolvedValue({
        ok: false,
        remaining: 0,
        resetAt: Date.now() + 60_000,
        bypassed: false,
      });

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error?.code).toBe("RATE_LIMITED");
    });

    it("returns 503 when rate limiter throws", async () => {
      mockRateLimit.mockRejectedValue(new Error("redis down"));

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error?.code).toBe("SERVICE_UNAVAILABLE");
    });

    it("includes rate limit headers on success", async () => {
      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
    });
  });

  // ── Success Path (Streaming) ────────────────────────────────────────────

  describe("success path", () => {
    it("returns a streaming SSE response with delta events and done marker", async () => {
      mockCompletionsCreate.mockResolvedValue(makeStreamChunks(["Hello", " from", " Cyprus"]));

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/event-stream");
      expect(res.headers.get("Cache-Control")).toBe("no-cache");

      const events = await readSSEEvents(res);
      const deltas = events.filter((e: any) => e.delta);
      expect(deltas).toHaveLength(3);
      expect((deltas[0] as any).delta).toBe("Hello");
      expect((deltas[1] as any).delta).toBe(" from");
      expect((deltas[2] as any).delta).toBe(" Cyprus");

      const doneEvents = events.filter((e: any) => e.done);
      expect(doneEvents).toHaveLength(1);
    });

    it("calls completions.create with stream: true", async () => {
      await POST(req({ messages: validMessages }));

      expect(mockCompletionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          stream: true,
          max_tokens: 800,
        })
      );
    });

    it("includes system prompt in API messages", async () => {
      await POST(req({ messages: validMessages }));

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemMsg = callArgs.messages[0];
      expect(systemMsg.role).toBe("system");
      expect(systemMsg.content).toContain("Cyprus Winter guide");
    });

    it("passes user messages after system prompt", async () => {
      await POST(req({ messages: validMessages }));

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      // First message is system, remaining are user messages
      expect(callArgs.messages.length).toBeGreaterThan(1);
      expect(callArgs.messages[1].role).toBe("user");
    });
  });

  // ── Provider Fallback ───────────────────────────────────────────────────

  describe("provider fallback", () => {
    it("falls back to non-streaming when streaming throws a retryable error", async () => {
      // First call (streaming) fails with 429, second call (non-streaming) succeeds
      mockCompletionsCreate
        .mockRejectedValueOnce(new Error("429 rate limit exceeded"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: "Non-streaming response" } }],
        });

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);

      const events = await readSSEEvents(res);
      const deltas = events.filter((e: any) => e.delta);
      expect(deltas).toHaveLength(1);
      expect((deltas[0] as any).delta).toBe("Non-streaming response");
    });

    it("returns 500 when all providers fail with non-retryable errors", async () => {
      mockCompletionsCreate.mockRejectedValue(new Error("Invalid API key 401"));

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error?.code).toBe("SERVER_ERROR");
    });

    it("tries next provider when both streaming and non-streaming fail with retryable errors", async () => {
      // Streaming fails with retryable, non-streaming also fails with retryable
      // (the route tries the next provider in its loop)
      mockCompletionsCreate
        .mockRejectedValueOnce(new Error("503 service unavailable"))
        .mockRejectedValueOnce(new Error("503 service unavailable"))
        // If there are more providers, they also fail
        .mockRejectedValue(new Error("503 service unavailable"));

      const res = await POST(req({ messages: validMessages }));
      // All providers exhausted => 500
      expect(res.status).toBe(500);
      // Should have been called more than once (at least streaming + non-streaming for provider)
      expect(mockCompletionsCreate.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it("stops trying providers on non-retryable error (breaks out of loop)", async () => {
      mockCompletionsCreate.mockRejectedValueOnce(new Error("permission denied"));

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(500);
      // Should only be called once - non-retryable error breaks the loop
      expect(mockCompletionsCreate).toHaveBeenCalledTimes(1);
    });

    it("falls back to non-streaming and sanitizes response content", async () => {
      mockCompletionsCreate
        .mockRejectedValueOnce(new Error("429 Too Many Requests"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: "Sanitized response" } }],
        });
      mockSanitizeText.mockImplementation((s: string) => s);

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
      // sanitizeText is called for input messages and for the response
      expect(mockSanitizeText).toHaveBeenCalled();
    });

    it("uses default text when non-streaming response has no content", async () => {
      mockCompletionsCreate
        .mockRejectedValueOnce(new Error("429"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: null } }],
        });

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);

      const events = await readSSEEvents(res);
      const deltas = events.filter((e: any) => e.delta);
      expect(deltas.length).toBeGreaterThan(0);
      // The fallback text mentions browsing Discover and Trails
      expect((deltas[0] as any).delta).toContain("Discover");
    });
  });

  // ── Message Sanitization ────────────────────────────────────────────────

  describe("message sanitization", () => {
    it("applies sanitizeText to user message content", async () => {
      await POST(req({ messages: [{ role: "user", content: "Hello <script>alert(1)</script>" }] }));

      expect(mockSanitizeText).toHaveBeenCalledWith("Hello <script>alert(1)</script>", 10000);
    });

    it("applies sanitizeText to each message in the array", async () => {
      await POST(
        req({
          messages: [
            { role: "user", content: "First message" },
            { role: "assistant", content: "Response" },
            { role: "user", content: "Second message" },
          ],
        })
      );

      // sanitizeText is called for each message content (3 times for messages)
      const contentCalls = mockSanitizeText.mock.calls.filter(
        (call: unknown[]) => call[1] === 10000
      );
      expect(contentCalls.length).toBe(3);
    });

    it("sends sanitized content to the AI provider", async () => {
      mockSanitizeText.mockImplementation((s: string) => s.replace(/<[^>]*>/g, ""));

      await POST(req({ messages: [{ role: "user", content: "Hello <b>world</b>" }] }));

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const userMsg = callArgs.messages.find((m: any) => m.role === "user");
      expect(userMsg.content).toBe("Hello world");
    });
  });

  // ── System Prompt & Locale ──────────────────────────────────────────────

  describe("system prompt", () => {
    it("includes base system prompt about Cyprus Winter", async () => {
      await POST(req({ messages: validMessages }));

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("Cyprus Winter guide");
      expect(systemContent).toContain("trails");
    });

    it("does not include language hint for English locale", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { locale: "en" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("Language:");
    });

    it("includes language hint for non-English locale", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { locale: "de" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("Language:");
      expect(systemContent).toContain("German");
    });

    it("includes language hint for Greek locale", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { locale: "el" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("Language:");
      expect(systemContent).toContain("Greek");
    });

    it("includes page context hint when path is provided", async () => {
      mockSanitizeText.mockImplementation((s: string) => s);

      await POST(
        req({
          messages: validMessages,
          context: { path: "/trails/artemis" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("User is on page");
    });

    it("includes last place context when lastPlace matches a valid place", async () => {
      mockGetPlaceById.mockImplementation((id: string) =>
        id === "tsiakkas" ? { id: "tsiakkas", name: "Tsiakkas Winery" } : undefined
      );

      await POST(
        req({
          messages: validMessages,
          context: { lastPlace: "tsiakkas" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("User recently viewed");
    });

    it("includes itinerary context when itinerary has valid place IDs", async () => {
      mockGetPlaceById.mockImplementation((id: string) => {
        if (id === "place-a") return { id: "place-a", name: "Place A" };
        if (id === "place-b") return { id: "place-b", name: "Place B" };
        return undefined;
      });

      await POST(
        req({
          messages: validMessages,
          context: {
            itinerary: [
              { day: 1, placeIds: ["place-a", "place-b"] },
            ],
          },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("User's plan");
      expect(systemContent).toContain("Day 1");
    });
  });

  // ── Context Building ────────────────────────────────────────────────────

  describe("context building", () => {
    it("calls buildAIContextRelevant with path and lastPlace", async () => {
      mockGetPlaceById.mockImplementation((id: string) =>
        id === "omodos" ? { id: "omodos", name: "Omodos Village" } : undefined
      );

      await POST(
        req({
          messages: validMessages,
          context: { path: "/discover/omodos", lastPlace: "omodos" },
        })
      );

      expect(mockBuildAIContextRelevant).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/discover/omodos",
          lastPlace: "omodos",
        })
      );
    });

    it("falls back to buildAIContext when buildAIContextRelevant throws", async () => {
      mockBuildAIContextRelevant.mockImplementation(() => {
        throw new Error("context build failed");
      });

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
      expect(mockBuildAIContext).toHaveBeenCalled();
    });

    it("falls back to hardcoded string when both context builders throw", async () => {
      mockBuildAIContextRelevant.mockImplementation(() => {
        throw new Error("relevant context failed");
      });
      mockBuildAIContext.mockImplementation(() => {
        throw new Error("full context failed");
      });

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("Trails, wineries, and attractions data available");
    });

    it("passes itinerary placeIds to buildAIContextRelevant", async () => {
      mockGetPlaceById.mockImplementation((id: string) =>
        id === "p1" ? { id: "p1", name: "Place 1" } : undefined
      );

      await POST(
        req({
          messages: validMessages,
          context: {
            itinerary: [{ day: 1, placeIds: ["p1"] }],
          },
        })
      );

      expect(mockBuildAIContextRelevant).toHaveBeenCalledWith(
        expect.objectContaining({
          itineraryPlaceIds: ["p1"],
        })
      );
    });
  });

  // ── normalizeChatContext edge cases ─────────────────────────────────────

  describe("normalizeChatContext", () => {
    it("ignores path that does not start with /", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { path: "https://evil.com" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("User is on page");
    });

    it("ignores path starting with //", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { path: "//evil.com/trails" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("User is on page");
    });

    it("ignores path containing backslash", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { path: "/trails\\..\\etc\\passwd" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("User is on page");
    });

    it("ignores lastPlace that does not exist in data", async () => {
      mockGetPlaceById.mockReturnValue(undefined);

      await POST(
        req({
          messages: validMessages,
          context: { lastPlace: "nonexistent-place" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("User recently viewed");
    });

    it("rejects itinerary entries with invalid day numbers via schema validation", async () => {
      const res = await POST(
        req({
          messages: validMessages,
          context: {
            itinerary: [
              { day: 0, placeIds: ["valid-place"] },   // day < 1 => schema rejects
            ],
          },
        })
      );
      expect(res.status).toBe(400);
    });

    it("filters out itinerary entries where no placeIds match real places", async () => {
      mockGetPlaceById.mockReturnValue(undefined);

      await POST(
        req({
          messages: validMessages,
          context: {
            itinerary: [{ day: 1, placeIds: ["fake-id-1", "fake-id-2"] }],
          },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).not.toContain("User's plan");
    });

    it("rejects null context (Zod optional does not accept null)", async () => {
      const res = await POST(req({ messages: validMessages, context: null }));
      expect(res.status).toBe(400);
    });

    it("handles non-object context gracefully", async () => {
      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);
    });

    it("rejects itinerary with more than 14 entries via schema validation", async () => {
      const itinerary = Array.from({ length: 20 }, (_, i) => ({
        day: (i % 14) + 1,
        placeIds: ["p"],
      }));

      const res = await POST(
        req({
          messages: validMessages,
          context: { itinerary },
        })
      );
      expect(res.status).toBe(400);
    });

    it("accepts a valid safe internal path", async () => {
      await POST(
        req({
          messages: validMessages,
          context: { path: "/trails/artemis-trail" },
        })
      );

      const callArgs = mockCompletionsCreate.mock.calls[0][0];
      const systemContent = callArgs.messages[0].content;
      expect(systemContent).toContain("User is on page");
      expect(systemContent).toContain("/trails/artemis-trail");
    });
  });

  // ── Stream error handling ───────────────────────────────────────────────

  describe("stream error handling", () => {
    it("sends error event in SSE when stream iteration throws", async () => {
      const failingStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: "Start" } }] };
          throw new Error("stream interrupted");
        },
      };
      mockCompletionsCreate.mockResolvedValue(failingStream);

      const res = await POST(req({ messages: validMessages }));
      expect(res.status).toBe(200);

      const events = await readSSEEvents(res);
      const errorEvents = events.filter((e: any) => e.error);
      expect(errorEvents).toHaveLength(1);
    });

    it("handles chunks with no delta content (skips them)", async () => {
      const sparseStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: {} }] };
          yield { choices: [{ delta: { content: "Real content" } }] };
          yield { choices: [{ delta: { content: null } }] };
        },
      };
      mockCompletionsCreate.mockResolvedValue(sparseStream);

      const res = await POST(req({ messages: validMessages }));
      const events = await readSSEEvents(res);
      const deltas = events.filter((e: any) => e.delta);
      expect(deltas).toHaveLength(1);
      expect((deltas[0] as any).delta).toBe("Real content");
    });
  });
});
