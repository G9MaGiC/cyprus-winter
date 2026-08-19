import { describe, it, expect } from "vitest";
import {
  jsonError,
  jsonRateLimited,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
  readJsonBody,
  RequestBodyTooLargeError,
} from "./api-response";

describe("jsonError", () => {
  it("returns response with error structure", async () => {
    const res = jsonError("VALIDATION_ERROR", "Invalid date", 400);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toEqual({ code: "VALIDATION_ERROR", message: "Invalid date" });
    expect(data.message).toBe("Invalid date");
  });

  it("omits details when not provided", async () => {
    const res = jsonError("NOT_FOUND", "Missing", 404);
    const data = await res.json();
    expect(data.error.details).toBeUndefined();
  });

  it("includes details when provided", async () => {
    const res = jsonError("VALIDATION_ERROR", "Invalid", 400, [
      { field: "email", message: "Must be valid email" },
    ]);
    const data = await res.json();
    expect(data.error.details).toEqual([
      { field: "email", message: "Must be valid email" },
    ]);
  });
});

describe("jsonRateLimited", () => {
  it("ceils fractional Retry-After to integer", async () => {
    const res = jsonRateLimited("Slow down", 1.3);
    expect(res.headers.get("Retry-After")).toBe("2");
  });

  it("returns 429 with Retry-After header", async () => {
    const res = jsonRateLimited("Too many requests", 60);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    const data = await res.json();
    expect(data.error.code).toBe("RATE_LIMITED");
  });
});

describe("jsonRateLimitedFromResult", () => {
  it("returns 429 with computed Retry-After", async () => {
    const future = Date.now() + 30 * 1000;
    const res = jsonRateLimitedFromResult("Too many", future);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("rateLimitSuccessHeaders", () => {
  it("includes remaining and limit", () => {
    const h = rateLimitSuccessHeaders(5, 10);
    expect(h["X-RateLimit-Remaining"]).toBe("5");
    expect(h["X-RateLimit-Limit"]).toBe("10");
  });

  it("clamps remaining to 0 when negative", () => {
    const h = rateLimitSuccessHeaders(-1, 10);
    expect(h["X-RateLimit-Remaining"]).toBe("0");
  });

  it("includes bypassed when true", () => {
    const h = rateLimitSuccessHeaders(10, 10, true);
    expect(h["X-RateLimit-Bypassed"]).toBe("true");
  });
});


describe("readJsonBody", () => {
  it("rejects oversized request bodies", async () => {
    const req = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: "x".repeat(500) }),
    });
    await expect(readJsonBody(req, 100)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });
});
