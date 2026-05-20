import { NextRequest } from "next/server";
import { getBookingsCountInRange } from "@/lib/bookings";
import { hasSupabase } from "@/lib/supabase";
import { getPartnerRevenueInRange } from "@/lib/partner-revenue";
import { getEventSourceBreakdownInRange, getFunnelCountsInRange } from "@/lib/funnel";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import {
  getPreviousStatsRange,
  getStatsRangeStartUtc,
  getStatsWindowLabel,
  parseStatsWindow,
} from "@/lib/stats-window";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

// Must be dynamic: fetches live bookings, revenue, funnel data
export const dynamic = "force-dynamic";

function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length === 0) return false;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers.get("x-admin-token");
  if (!!token && token === secret) return true;
  const sessionRaw = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return !!sessionRaw && verifyAdminSessionToken(sessionRaw, secret);
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

const SOURCE_BREAKDOWN_EVENTS = ["shop_click", "plan_add"];

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
    return jsonError("UNAUTHORIZED", "Unauthorized", 401);
  }
  try {
    const window = parseStatsWindow(req.nextUrl.searchParams.get("window"));
    const now = new Date();
    const rangeStart = getStatsRangeStartUtc(window, now);
    const rangeEnd = now;
    const prevRange = getPreviousStatsRange(rangeStart, rangeEnd);

    const [current, previous] = await Promise.all([
      Promise.all([
        getBookingsCountInRange(rangeStart, rangeEnd),
        getPartnerRevenueInRange(rangeStart, rangeEnd),
        getFunnelCountsInRange(rangeStart, rangeEnd),
        getEventSourceBreakdownInRange(SOURCE_BREAKDOWN_EVENTS, rangeStart, rangeEnd),
      ]),
      Promise.all([
        getBookingsCountInRange(prevRange.start, prevRange.end),
        getPartnerRevenueInRange(prevRange.start, prevRange.end),
        getFunnelCountsInRange(prevRange.start, prevRange.end),
        getEventSourceBreakdownInRange(SOURCE_BREAKDOWN_EVENTS, prevRange.start, prevRange.end),
      ]),
    ]);
    const [bookingsThisMonth, partnerRevenue, funnelCounts, sourceBreakdown] = current;
    const [bookingsPrev, partnerRevenuePrev, funnelCountsPrev, sourceBreakdownPrev] = previous;
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
        sourceBreakdown,
        compare: {
          bookings: bookingsPrev,
          partnerRevenueEur: partnerRevenuePrev.totalRevenueEur,
          funnelCounts: funnelCountsPrev,
          sourceBreakdown: sourceBreakdownPrev,
          rangeStartIso: prevRange.start.toISOString(),
          rangeEndIso: prevRange.end.toISOString(),
        },
        window,
        windowLabel: getStatsWindowLabel(window),
        rangeStartIso: rangeStart.toISOString(),
        rangeEndIso: rangeEnd.toISOString(),
        storage: usesDb ? "supabase" : "memory",
      },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 30, limitResult.bypassed) }
    );
  } catch (err) {
    console.error("Stats API error:", err);
    return jsonError("SERVER_ERROR", "Failed to load stats", 500);
  }
}
