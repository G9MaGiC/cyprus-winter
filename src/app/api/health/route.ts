import { NextResponse } from "next/server";
import { getSupabase, hasSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import {
  getProductionEnvChecks,
  productionEnvReady,
  toAnnexProductionChecks,
} from "@/lib/production-readiness";
import { constantTimeEquals } from "@/lib/secret-compare";

// Health check must run at request time (Supabase connectivity, env)
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let limitResult: RateLimitResult | null = null;
  try {
    limitResult = await rateLimit(req, 60, "health");
  } catch {
    // Health must still expose readiness diagnostics when Redis is missing in production.
    limitResult = null;
  }
  if (limitResult && !limitResult.ok) {
    return jsonRateLimitedFromResult("Too many health checks", limitResult.resetAt);
  }
  const production = process.env.NODE_ENV === "production";
  const healthSecret = process.env.HEALTH_SECRET;
  const authorized = Boolean(
    healthSecret &&
    constantTimeEquals(req.headers.get("authorization") ?? "", `Bearer ${healthSecret}`)
  );
  const exposeDetails = !production || authorized;

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

  if (exposeDetails && emailConfigured && process.env.RESEND_API_KEY) {
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

  const productionChecks = toAnnexProductionChecks(getProductionEnvChecks());
  const productionReady = productionEnvReady();
  const ok = (!production || productionReady) && (!hasSupabase() || supabaseOk);

  const headers: HeadersInit = {
    ...(limitResult
      ? rateLimitSuccessHeaders(limitResult.remaining, 60, limitResult.bypassed)
      : {}),
    "Cache-Control": "no-store",
  };
  const publicBody = {
    ok,
    message: ok ? "OK" : "Unavailable",
    productionReady,
  };
  const detailed = {
    ok,
    message: ok
      ? "Cyprus Winter is up. Mediterranean winter escape—we're here."
      : "Production dependencies are not ready.",
    ai,
    storage,
    email: emailConfigured,
    resend: resendStatus,
    supabase: hasSupabase() ? (supabaseOk ? "ok" : "error") : "not configured",
    productionReady,
    productionChecks: productionChecks.length > 0 ? productionChecks : undefined,
  };

  return NextResponse.json(exposeDetails ? detailed : publicBody, {
    status: ok ? 200 : 503,
    headers,
  });
}
