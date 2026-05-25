import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function req(body: unknown) {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.10",
    },
    body: JSON.stringify(body),
  });
}

async function collectSseEvents(res: Response) {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((event) => event.replace(/^data: /, ""))
    .map((event) => JSON.parse(event) as Record<string, unknown>);
}

async function* chatCompletionChunks(content: string) {
  yield { choices: [{ delta: { content } }] };
}

describe("POST /api/chat metadata sanitization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("AI_GATEWAY_API_KEY", "unit-test-key");
    vi.doMock("@/lib/rate-limit", () => ({
      rateLimit: vi.fn(async () => ({
        ok: true,
        remaining: 19,
        resetAt: Date.now() + 60_000,
        bypassed: true,
      })),
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("openai");
    vi.doUnmock("@/lib/rate-limit");
    vi.resetModules();
  });

  it("drops malformed AI metadata before streaming it to the client", async () => {
    const providerOutput = [
      "Try Kourion in the morning.",
      "---ACTIONS---",
      JSON.stringify({
        cards: "not-an-array",
        followUps: "not-an-array",
        actions: [
          {
            type: "open_place",
            label: { text: "Open Kourion" },
            payload: { path: "https://evil.example/discover/kourion" },
          },
        ],
      }),
    ].join("");

    vi.doMock("openai", () => ({
      default: class MockOpenAI {
        chat = {
          completions: {
            create: vi.fn(async () => chatCompletionChunks(providerOutput)),
          },
        };
      },
    }));

    const { POST } = await import("./route");
    const res = await POST(
      req({
        messages: [{ role: "user", content: "What should I visit?" }],
        context: { path: "/discover" },
      })
    );

    expect(res.status).toBe(200);
    const events = await collectSseEvents(res);
    const metadata = events.find((event) => event.type === "metadata");

    expect(metadata).toEqual({ type: "metadata" });
  });
});
