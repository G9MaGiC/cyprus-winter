import { describe, expect, it } from "vitest";
import { isSafeUrl } from "./safe-url";

describe("isSafeUrl", () => {
  it("allows relative app paths and http(s) URLs", () => {
    expect(isSafeUrl("/trails/artemis")).toBe(true);
    expect(isSafeUrl("/discover/kourion?from=chat")).toBe(true);
    expect(isSafeUrl("#day-2")).toBe(true);
    expect(isSafeUrl("https://cyprus-winter.app/plan")).toBe(true);
    expect(isSafeUrl("http://localhost:3000/plan")).toBe(true);
  });

  it("rejects protocol-relative URLs that would open-redirect", () => {
    expect(isSafeUrl("//evil.example/phish")).toBe(false);
    expect(isSafeUrl("  //evil.example  ")).toBe(false);
    expect(isSafeUrl("//EVIL.EXAMPLE")).toBe(false);
  });

  it("rejects dangerous protocols including entity-encoded javascript", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(isSafeUrl("&#106;avascript:alert(1)")).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});
