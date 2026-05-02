import { describe, it, expect } from "vitest";
import { createAdminSessionToken, verifyAdminSessionToken } from "./admin-session";

describe("admin session token", () => {
  const secret = "test-secret-key";

  it("round-trips and verifies", () => {
    const t = createAdminSessionToken(secret);
    expect(verifyAdminSessionToken(t, secret)).toBe(true);
    expect(verifyAdminSessionToken(t, "wrong")).toBe(false);
  });

  it("rejects tampered token", () => {
    const t = createAdminSessionToken(secret);
    const tampered = t.slice(0, -4) + "xxxx";
    expect(verifyAdminSessionToken(tampered, secret)).toBe(false);
  });
});
