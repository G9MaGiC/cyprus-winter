import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonRateLimitedFromResult } from "@/lib/api-response";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET;
  return s && s.length > 0 ? s : null;
}

/** Ping: returns 200 if the HttpOnly admin session cookie is valid. */
export async function GET(req: NextRequest) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 60, "stats");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }

  const secret = getSecret();
  if (!secret) {
    return jsonError("SERVICE_UNAVAILABLE", "Admin session not configured.", 503);
  }

  const raw = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw || !verifyAdminSessionToken(raw, secret)) {
    return jsonError("VALIDATION_ERROR", "Unauthorized", 401);
  }

  return NextResponse.json({ ok: true });
}

/** Exchange ADMIN_SECRET for an HttpOnly session cookie (prefer over Bearer in browser). */
export async function POST(req: NextRequest) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 10, "stats");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }

  const secret = getSecret();
  if (!secret) {
    return jsonError("SERVICE_UNAVAILABLE", "Admin session not configured.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const token =
    typeof body === "object" &&
    body !== null &&
    "secret" in body &&
    typeof (body as { secret?: unknown }).secret === "string"
      ? (body as { secret: string }).secret.trim()
      : "";

  if (!token || token !== secret) {
    return jsonError("VALIDATION_ERROR", "Unauthorized", 401);
  }

  const value = createAdminSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

/** Clear admin session cookie (logout). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
