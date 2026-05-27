import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST, DELETE } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";

describe("admin session API", () => {
  const secret = "test-admin-secret";

  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", secret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("POST returns 401 for wrong secret", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.50" },
      body: JSON.stringify({ secret: "wrong" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST sets HttpOnly cookie for valid secret", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.51" },
      body: JSON.stringify({ secret }),
    });
    const res = (await POST(req)) as NextResponse;
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(ADMIN_SESSION_COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
  });

  it("GET returns 401 without valid cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/session", {
      headers: { "x-forwarded-for": "127.0.0.52" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET returns 200 with valid session cookie", async () => {
    const token = createAdminSessionToken(secret);
    const req = new NextRequest("http://localhost:3000/api/admin/session", {
      headers: { "x-forwarded-for": "127.0.0.53" },
    });
    req.cookies.set(ADMIN_SESSION_COOKIE, token);
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("DELETE clears session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/session", {
      method: "DELETE",
      headers: { "x-forwarded-for": "127.0.0.60" },
    });
    const res = (await DELETE(req)) as NextResponse;
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(ADMIN_SESSION_COOKIE);
    expect(cookie?.maxAge).toBe(0);
  });
});
