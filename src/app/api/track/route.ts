import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { TRACK_EVENTS } from "@/lib/track-events";

const trackBodySchema = z.object({
  event: z.string().min(1).max(64),
  eventId: z.string().uuid().optional(),
  sessionId: z.string().max(128).regex(/^[A-Za-z0-9_-]*$/).optional().nullable(),
  properties: z
    .record(z.string(), z.union([z.string().max(200), z.number().finite(), z.boolean(), z.null()]))
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const keys = Object.keys(v);
        if (keys.length > 30) return false;
        if (JSON.stringify(v).length > 2048) return false;
        return keys.every((k) => k.length >= 1 && k.length <= 64 && /^[A-Za-z0-9_.-]+$/.test(k));
      },
      { message: "Invalid properties" }
    ),
});

const ALLOWED_EVENTS = new Set<string>(TRACK_EVENTS);

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

const EVENT_DEDUPE_TTL_MS = 10 * 60 * 1000;
const EVENT_DEDUPE_MAX_SIZE = 5_000;
const recentlySeenEventIds = new Map<string, number>();

function isDuplicateEventId(eventId: string): boolean {
  const now = Date.now();
  // Opportunistic cleanup of expired entries
  for (const [key, ts] of recentlySeenEventIds) {
    if (now - ts > EVENT_DEDUPE_TTL_MS) recentlySeenEventIds.delete(key);
  }
  const last = recentlySeenEventIds.get(eventId);
  if (last != null && now - last <= EVENT_DEDUPE_TTL_MS) return true;
  // Hard cap: stop inserting when map is full to prevent memory exhaustion
  if (recentlySeenEventIds.size < EVENT_DEDUPE_MAX_SIZE) {
    recentlySeenEventIds.set(eventId, now);
  }
  return false;
}

export async function POST(req: NextRequest) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 120, "track");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }
  try {
    const raw = await req.json();
    const parsed = trackBodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((e) => e.message).join("; ") || "Invalid request body";
      return jsonError("BAD_REQUEST", msg, 400);
    }
    const { event: eventVal, eventId, sessionId: sessionIdVal, properties: propertiesVal } = parsed.data;
    const event = eventVal.trim();
    if (!event || !ALLOWED_EVENTS.has(event)) {
      return jsonError("BAD_REQUEST", "Invalid event", 400);
    }

    if (eventId && isDuplicateEventId(eventId)) {
      return Response.json(
        { ok: true, stored: false, deduped: true },
        { headers: rateLimitSuccessHeaders(limitResult.remaining, 120, limitResult.bypassed) }
      );
    }

    const sessionIdResult = normalizeSessionId(sessionIdVal ?? null);
    if (!sessionIdResult.ok) {
      return jsonError("BAD_REQUEST", sessionIdResult.error, 400);
    }
    const propertiesResult = normalizeProperties(propertiesVal ?? {});
    if (!propertiesResult.ok) {
      return jsonError("BAD_REQUEST", propertiesResult.error, 400);
    }

    let stored = false;
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from("conversion_events").insert({
        event,
        event_id: eventId,
        properties: {
          ...propertiesResult.value,
          user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200) || undefined,
        },
        session_id: sessionIdResult.value,
      });
      stored = !error;
      if (error) console.error("Track API storage error:", error);
    }
    return Response.json(
      { ok: true, stored, deduped: false },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 120, limitResult.bypassed) }
    );
  } catch (err) {
    console.error("Track API error:", err);
    return jsonError("SERVER_ERROR", "Internal error", 500);
  }
}
