import { afterEach, describe, expect, it, vi } from "vitest";

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
      // Unique to this file: bookings/route.test.ts uses 127.0.0.91, and the
      // in-memory rate limiter is shared per worker — a colliding IP turns
      // this request into a 429 depending on file order (observed flake).
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
