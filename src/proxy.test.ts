import { describe, expect, it, vi } from "vitest";
import proxy from "./proxy";

vi.mock("next-intl/middleware", () => ({
  default: () => () => ({ headers: new Headers() }),
}));

describe("proxy content security policy", () => {
  it("allows the OpenStreetMap frames and tiles used by map surfaces", () => {
    const response = proxy({} as Parameters<typeof proxy>[0]);
    const policy = response.headers.get("Content-Security-Policy");

    expect(policy).toContain("frame-src 'self' https://www.openstreetmap.org");
    expect(policy).toContain("https://*.tile.openstreetmap.org");
  });
});
