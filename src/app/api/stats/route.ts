import { NextRequest } from "next/server";
import { getBookingsCountThisMonth } from "@/lib/bookings";
import { hasSupabase } from "@/lib/supabase";
import { getPartnerRevenueThisMonth } from "@/lib/partner-revenue";
import { getFunnelCountsThisMonth } from "@/lib/funnel";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";

// Must be dynamic: fetches live bookings, revenue, funnel data
export const dynamic = "force-dynamic";

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length === 0) return false;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers.get("x-admin-token");
  return !!token && token === secret;
}

const FUNNEL_ORDER = [
  "page_view",
  "discover_view",
  "winery_detail_view",
  "shop_click",
  "plan_add",
  "booking_start",
  "booking_complete",
];

/**
 * Traction metrics for YC / ops. Bookings, partner revenue, conversion funnel.
 * Requires ADMIN_SECRET in Authorization: Bearer <secret> or x-admin-token header.
 */
export async function GET(req: NextRequest) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 30, "stats");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }
  if (!isAdminAuthorized(req)) {
    return jsonError("BAD_REQUEST", "Unauthorized", 401);
  }
  try {
    const [bookingsThisMonth, partnerRevenue, funnelCounts] = await Promise.all([
      getBookingsCountThisMonth(),
      getPartnerRevenueThisMonth(),
      getFunnelCountsThisMonth(),
    ]);
    const usesDb = hasSupabase();

    const funnel = FUNNEL_ORDER.map((event) => ({
      event,
      count: funnelCounts[event] ?? 0,
    }));

    return Response.json(
      {
        bookingsThisMonth,
        partnerRevenueEur: partnerRevenue.totalRevenueEur,
        partnerRevenueByWinery: partnerRevenue.byPartner,
        funnel,
        funnelCounts,
        storage: usesDb ? "supabase" : "memory",
      },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 30, limitResult.bypassed) }
    );
  } catch (err) {
    console.error("Stats API error:", err);
    return jsonError("SERVER_ERROR", "Failed to load stats", 500);
  }
}
