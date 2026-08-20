import { describe, expect, it } from "vitest";
import { buildAnnexHealthEvidence, toAnnexPublicHealth } from "./grant-health-evidence";

describe("toAnnexPublicHealth", () => {
  it("only sets productionReady when the live boolean is true", () => {
    expect(toAnnexPublicHealth({ ok: true, message: "OK", productionReady: true })).toEqual({
      ok: true,
      message: "OK",
      productionReady: true,
    });
    expect(toAnnexPublicHealth({ ok: false, message: "Unavailable", productionReady: false })).toEqual({
      ok: false,
      message: "Unavailable",
      productionReady: false,
    });
  });

  it("does not treat a string or missing field as ready", () => {
    expect(toAnnexPublicHealth({ productionReady: "true" }).productionReady).toBe(false);
    expect(toAnnexPublicHealth({}).productionReady).toBe(false);
  });

  it("drops detailed dump fields from the annex public slice", () => {
    const sliced = toAnnexPublicHealth({
      ok: false,
      message: "Unavailable",
      productionReady: false,
      productionChecks: [{ id: "upstash", hint: "Set UPSTASH_REDIS_REST_URL" }],
      supabase: "error",
    });
    expect(sliced).toEqual({
      ok: false,
      message: "Unavailable",
      productionReady: false,
    });
    expect(JSON.stringify(sliced)).not.toMatch(/UPSTASH|hint|supabase/i);
  });
});

describe("buildAnnexHealthEvidence", () => {
  it("records url and status without inventing productionReady", () => {
    const evidence = buildAnnexHealthEvidence({
      capturedAt: new Date("2026-08-20T14:47:10.000Z"),
      url: "https://cyprus-winter.vercel.app/api/health",
      httpStatus: 503,
      json: { ok: false, message: "Unavailable", productionReady: false },
    });
    expect(evidence.httpStatus).toBe(503);
    expect(evidence.public.productionReady).toBe(false);
  });
});
