import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/trail-reports", () => ({
  createTrailReport: vi.fn().mockResolvedValue({
    report: {
      id: "r-1",
      trailId: "artemis",
      status: "open",
      surface: "dry",
      createdAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
    },
    stored: true,
  }),
}));

function postReq(body: unknown, ip = "127.0.0.9") {
  return new Request("http://localhost:3000/api/trail-reports", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  trailId: "artemis",
  status: "open" as const,
  surface: "dry" as const,
};

describe("POST /api/trail-reports", () => {
  it("returns 400 for invalid body", async () => {
    const res = await POST(postReq({ trailId: "artemis" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for unknown trail", async () => {
    const res = await POST(
      postReq({ ...validBody, trailId: "unknown-trail-xyz" }, "127.0.0.10")
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error?.code).toBe("NOT_FOUND");
  });

  it("returns 200 for valid request", async () => {
    const res = await POST(postReq(validBody, "127.0.0.11"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.report).toBeDefined();
    expect(data.report.trailId).toBe("artemis");
    expect(data.stored).toBe(true);
  });
});
