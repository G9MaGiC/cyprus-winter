import { describe, it, expect } from "vitest";
import { POST } from "./route";

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

describe("POST /api/chat", () => {
  it("returns 400 for missing messages", async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid messages format", async () => {
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
});
