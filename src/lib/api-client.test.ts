import { describe, it, expect } from "vitest";
import { safeJson, getApiErrorCode, getRetryAfterSeconds } from "./api-client";

describe("safeJson", () => {
  it("parses valid JSON response", async () => {
    const res = new Response(JSON.stringify({ ok: true }));
    expect(await safeJson(res)).toEqual({ ok: true });
  });

  it("returns empty object for invalid JSON", async () => {
    const res = new Response("not-json");
    expect(await safeJson(res)).toEqual({});
  });

  it("returns empty object for empty body", async () => {
    const res = new Response("");
    expect(await safeJson(res)).toEqual({});
  });
});

describe("getApiErrorCode", () => {
  it("extracts error code from standard envelope", () => {
    expect(getApiErrorCode({ error: { code: "RATE_LIMITED", message: "slow down" } })).toBe(
      "RATE_LIMITED"
    );
  });

  it("returns undefined when no error object", () => {
    expect(getApiErrorCode({ message: "ok" })).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(getApiErrorCode(null)).toBeUndefined();
  });

  it("returns undefined for non-object input", () => {
    expect(getApiErrorCode("string")).toBeUndefined();
    expect(getApiErrorCode(42)).toBeUndefined();
  });

  it("returns undefined when error.code is not a string", () => {
    expect(getApiErrorCode({ error: { code: 123 } })).toBeUndefined();
  });

  it("returns undefined when error has no code", () => {
    expect(getApiErrorCode({ error: { message: "oops" } })).toBeUndefined();
  });
});

describe("getRetryAfterSeconds", () => {
  it("returns numeric Retry-After value", () => {
    const res = new Response("", { headers: { "Retry-After": "30" } });
    expect(getRetryAfterSeconds(res)).toBe(30);
  });

  it("returns undefined when header is missing", () => {
    const res = new Response("");
    expect(getRetryAfterSeconds(res)).toBeUndefined();
  });

  it("returns undefined for non-numeric value", () => {
    const res = new Response("", { headers: { "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT" } });
    expect(getRetryAfterSeconds(res)).toBeUndefined();
  });

  it("returns 0 when Retry-After is 0", () => {
    const res = new Response("", { headers: { "Retry-After": "0" } });
    expect(getRetryAfterSeconds(res)).toBe(0);
  });
});
