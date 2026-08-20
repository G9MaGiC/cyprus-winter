import { describe, expect, it } from "vitest";
import { TOKENS } from "@/lib/design-tokens";
import { buildPwaManifest, pwaManifestHref } from "./pwa-manifest";

describe("buildPwaManifest", () => {
  it("uses unprefixed URLs for the default locale", async () => {
    const manifest = await buildPwaManifest("en");
    expect(manifest).not.toBeNull();
    expect(manifest!.start_url).toBe("/");
    expect(manifest!.scope).toBe("/");
    expect(manifest!.lang).toBe("en");
    expect(manifest!.dir).toBe("ltr");
    expect(manifest!.theme_color).toBe(TOKENS.terracotta);
    expect(manifest!.background_color).toBe(TOKENS.sand);
    expect(manifest!.shortcuts?.map((s) => s.url)).toEqual(["/#right-now", "/plan"]);
    expect(manifest!.icons?.every((i) => i.src.startsWith("/icon-"))).toBe(true);
    expect(manifest!.icons?.some((i) => i.purpose === "any")).toBe(true);
    expect(manifest!.icons?.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("prefixes non-default locales and localizes copy", async () => {
    const manifest = await buildPwaManifest("de");
    expect(manifest).not.toBeNull();
    expect(manifest!.start_url).toBe("/de");
    expect(manifest!.scope).toBe("/de");
    expect(manifest!.lang).toBe("de");
    expect(manifest!.dir).toBe("ltr");
    expect(manifest!.shortcuts?.map((s) => s.url)).toEqual(["/de#right-now", "/de/plan"]);
    expect(manifest!.name).toContain("Cyprus Winter");
    expect(manifest!.name).not.toBe(
      "Cyprus Winter — Plan Ahead or Start Exploring"
    );
  });

  it("marks Hebrew as rtl with /he URLs", async () => {
    const manifest = await buildPwaManifest("he");
    expect(manifest).not.toBeNull();
    expect(manifest!.lang).toBe("he");
    expect(manifest!.dir).toBe("rtl");
    expect(manifest!.start_url).toBe("/he");
    expect(manifest!.shortcuts?.map((s) => s.url)).toEqual(["/he#right-now", "/he/plan"]);
  });

  it("returns null for unknown locales", async () => {
    expect(await buildPwaManifest("xx")).toBeNull();
  });
});

describe("pwaManifestHref", () => {
  it("points at the locale-explicit route", () => {
    expect(pwaManifestHref("en")).toBe("/manifests/en");
    expect(pwaManifestHref("de")).toBe("/manifests/de");
    expect(pwaManifestHref("bogus")).toBe("/manifests/en");
  });
});
