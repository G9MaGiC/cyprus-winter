import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { wineries } from "@/data/wineries";
import { classifyWineryImageSource, resolveWineryImage } from "./cyprus-images";

const VERIFIED_PARTNER_IDS = wineries.filter((w) => w.isVerified).map((w) => w.id);

describe("winery image intake metrics", () => {
  it("every winery image resolves to a file on disk", () => {
    for (const winery of wineries) {
      const url = resolveWineryImage(winery.id);
      expect(existsSync(join(process.cwd(), "public", url)), `${winery.id} -> ${url}`).toBe(true);
    }
  });

  it("reports per-id vs regional coverage for intake dashboard", () => {
    const counts = { "per-id": 0, "partner-overlay": 0, "wine-route": 0, fallback: 0 };
    for (const winery of wineries) {
      counts[classifyWineryImageSource(winery.id)] += 1;
    }
    expect(counts["per-id"] + counts["partner-overlay"]).toBeGreaterThanOrEqual(6);
    // 44 public wineries after the 2026-09-02 quarantine (was 71).
    expect(wineries.length).toBeGreaterThan(40);
    expect(counts.fallback).toBe(0);
  });

  it("verified partners resolve without generic troodos fallback", () => {
    // Zero verified partners until written authorization exists (BUG-355;
    // docs/PARTNER_DATA_VERIFICATION_2026-09-02.md). The loop re-engages per
    // partner when a real one onboards.
    expect(VERIFIED_PARTNER_IDS.length).toBe(0);
    for (const id of VERIFIED_PARTNER_IDS) {
      const url = resolveWineryImage(id);
      expect(url).not.toBe("/images/cyprus/cyprus-winery-troodos.jpg");
      expect(classifyWineryImageSource(id)).not.toBe("fallback");
    }
  });

  it("domes-sergiou uses partner hero asset", () => {
    expect(resolveWineryImage("domes-sergiou")).toBe("/images/cyprus/domes-sergiou-hero.png");
    expect(classifyWineryImageSource("domes-sergiou")).toBe("per-id");
  });

  it("tsiakkas uses dedicated per-id file", () => {
    expect(resolveWineryImage("tsiakkas")).toBe("/images/cyprus/winery-tsiakkas.jpg");
    expect(classifyWineryImageSource("tsiakkas")).toBe("per-id");
  });
});
