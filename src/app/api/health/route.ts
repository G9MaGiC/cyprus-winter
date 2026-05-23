import { NextResponse } from "next/server";
import { getSupabase, hasSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import {
  getProductionEnvChecks,
  productionEnvReady,
} from "@/lib/production-readiness";

// Health check must run at request time (Supabase connectivity, env)
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 60, "health");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many health checks", limitResult.resetAt);
  }
  const ai = !!(
    process.env.AI_GATEWAY_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OLLAMA_BASE_URL ||
    process.env.MOONSHOT_API_KEY ||
    process.env.OPENAI_API_KEY
  );
  const emailConfigured = !!process.env.RESEND_API_KEY;
  let storage: "supabase" | "memory" = hasSupabase() ? "supabase" : "memory";
  let supabaseOk = true;
  let resendStatus: "ok" | "error" | "not configured" = "not configured";

  if (hasSupabase()) {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from("bookings").select("id").limit(1);
        supabaseOk = !error;
      }
    } catch {
      supabaseOk = false;
      storage = "memory";
    }
  }

  if (emailConfigured && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      resendStatus = res.ok ? "ok" : "error";
    } catch {
      resendStatus = "error";
    }
  }

  const ok = !hasSupabase() || supabaseOk;
  const productionChecks = getProductionEnvChecks();
  const productionReady = productionEnvReady();

  const headers: HeadersInit = {
    ...rateLimitSuccessHeaders(limitResult.remaining, 60, limitResult.bypassed),
    "Cache-Control": ok ? "public, s-maxage=60, stale-while-revalidate=120" : "no-store",
  };
  return NextResponse.json(
    {
      ok,
      message: ok
        ? "Cyprus Winter is up. Mediterranean winter escape—we're here."
        : "Supabase unreachable",
      ai,
      storage,
      email: emailConfigured,
      resend: resendStatus,
      supabase: hasSupabase() ? (supabaseOk ? "ok" : "error") : "not configured",
      productionReady,
      productionChecks: productionChecks.length > 0 ? productionChecks : undefined,
    },
    { status: ok ? 200 : 503, headers }
  );
}
