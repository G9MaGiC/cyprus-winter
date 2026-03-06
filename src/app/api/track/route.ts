import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "discover_view",
  "winery_detail_view",
  "booking_start",
  "booking_complete",
  "shop_click",
  "plan_add",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeSessionId(
  input: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (input == null) return { ok: true, value: null };
  if (typeof input !== "string") return { ok: false, error: "Invalid sessionId" };
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > 128) return { ok: false, error: "sessionId too long" };
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return { ok: false, error: "Invalid sessionId format" };
  return { ok: true, value: trimmed };
}

function normalizeProperties(
  input: unknown
):
  | { ok: true; value: Record<string, string | number | boolean | null> }
  | { ok: false; error: string } {
  if (input == null) return { ok: true, value: {} };
  if (!isPlainObject(input)) return { ok: false, error: "Invalid properties" };

  const keys = Object.keys(input);
  if (keys.length > 30) return { ok: false, error: "Too many properties" };

  const approxSize = JSON.stringify(input).length;
  if (approxSize > 2048) return { ok: false, error: "Properties too large" };

  const out: Record<string, string | number | boolean | null> = {};
  for (const key of keys) {
    if (key.length === 0 || key.length > 64) return { ok: false, error: "Invalid property key" };
    if (!/^[A-Za-z0-9_.-]+$/.test(key)) return { ok: false, error: "Invalid property key" };

    const value = input[key];
    if (value == null) {
      out[key] = null;
      continue;
    }
    if (typeof value === "string") {
      if (value.length > 200) return { ok: false, error: "Property value too long" };
      out[key] = value;
      continue;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return { ok: false, error: "Invalid number property" };
      out[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      out[key] = value;
      continue;
    }
    return { ok: false, error: "Invalid property value" };
  }

  return { ok: true, value: out };
}

export async function POST(req: NextRequest) {
  const limitResult = rateLimit(req, 120);
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }
  try {
    const body = await req.json();
    const event = String(body.event ?? "").trim();
    const sessionIdResult = normalizeSessionId(body.sessionId);
    if (!sessionIdResult.ok) {
      return jsonError("BAD_REQUEST", sessionIdResult.error, 400);
    }
    const propertiesResult = normalizeProperties(body.properties);
    if (!propertiesResult.ok) {
      return jsonError("BAD_REQUEST", propertiesResult.error, 400);
    }

    if (!event || !ALLOWED_EVENTS.has(event)) {
      return jsonError("BAD_REQUEST", "Invalid event", 400);
    }

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from("conversion_events").insert({
        event,
        properties: {
          ...propertiesResult.value,
          user_agent: req.headers.get("user-agent") ?? undefined,
        },
        session_id: sessionIdResult.value,
      });
    }
    return Response.json(
      { ok: true },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 120) }
    );
  } catch (err) {
    console.error("Track API error:", err);
    return jsonError("SERVER_ERROR", "Internal error", 500);
  }
}
