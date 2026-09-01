import { afterEach, describe, expect, it, vi } from "vitest";

// This test asserts provider-unavailability handling, not rate limiting —
// but the in-memory limiter is process state shared across every file a
// vitest worker runs, which made this order-dependently flaky (it still
// flaked after moving to a unique IP). Stub the limiter to always allow so
// the 503 path is deterministic regardless of what ran before.
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    rateLimit: vi.fn(async () => ({
      ok: true,
      remaining: 999999,
      resetAt: Date.now() + 60_000,
      bypassed: true,
    })),
  };
});

const AI_ENV_KEYS = [
  "AI_GATEWAY_API_KEY",
  "XAI_API_KEY",
  "GROQ_API_KEY",
  "OLLAMA_BASE_URL",
  "MOONSHOT_API_KEY",
  "OPENAI_API_KEY",
] as const;

function chatReq() {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.191",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello" }],
    }),
  });
}

describe("POST /api/chat with no AI providers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 503 without leaking env var names", async () => {
    vi.resetModules();
    for (const key of AI_ENV_KEYS) {
      vi.stubEnv(key, "");
    }
    const { POST } = await import("./route");
    const res = await POST(chatReq());
    expect(res.status).toBe(503);
    const data = (await res.json()) as { error?: { code?: string; message?: string }; message?: string };
    expect(data.error?.code).toBe("SERVICE_UNAVAILABLE");
    const combined = `${data.error?.message ?? ""} ${data.message ?? ""}`;
    expect(combined).not.toMatch(/API_KEY|OLLAMA_BASE_URL|\.env\.local/i);
  });
});
