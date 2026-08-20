import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /manifests/[locale]", () => {
  it("returns application/manifest+json for a valid locale", async () => {
    const res = await GET(new Request("http://localhost/manifests/de"), {
      params: Promise.resolve({ locale: "de" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/manifest\+json/);
    const body = await res.json();
    expect(body.start_url).toBe("/de");
    expect(body.lang).toBe("de");
    expect(body.ok).toBeUndefined();
  });

  it("returns 404 for an unknown locale", async () => {
    const res = await GET(new Request("http://localhost/manifests/xx"), {
      params: Promise.resolve({ locale: "xx" }),
    });
    expect(res.status).toBe(404);
  });
});
