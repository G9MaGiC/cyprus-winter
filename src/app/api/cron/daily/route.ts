import { NextRequest } from "next/server";
import { refreshTrailSummary } from "@/lib/trail-summary-cache";
import {
  getSubscribersForTripCountdown,
  markPushSent,
  deletePushSubscription,
} from "@/lib/push-subscriptions";
import { sendPush, isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getCountdownCopy(daysUntil: number): { title: string; body: string } {
  if (daysUntil === 1) {
    return {
      title: "Cyprus Winter",
      body: "Tomorrow you're here. Your Day 1 plan is ready.",
    };
  }
  if (daysUntil === 2) {
    return {
      title: "Cyprus Winter",
      body: "Two days until you're here. Your Day 1 plan is ready.",
    };
  }
  return {
    title: "Cyprus Winter",
    body: "Three days until you're here. Your Day 1 plan is ready.",
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const summary = await refreshTrailSummary();

    let pushesSent = 0;
    if (isPushConfigured()) {
      const subs = await getSubscribersForTripCountdown();
      const today = new Date();
      for (const row of subs) {
        if (!row.trip_start_date) continue;
        const tripStart = new Date(row.trip_start_date);
        const daysUntil = Math.ceil((tripStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil < 1 || daysUntil > 3) continue;
        const { title, body } = getCountdownCopy(daysUntil);
        const result = await sendPush(row.subscription, {
          title,
          body,
          url: "/plan",
        });
        if (result.ok) {
          await markPushSent(row.id);
          pushesSent++;
        } else if (result.expired) {
          await deletePushSubscription(row.id);
        }
      }
    }

    return Response.json({
      ok: true,
      trails: Object.keys(summary).length,
      pushesSent,
      updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron daily error:", err);
    const errorMsg =
      process.env.NODE_ENV === "production" ? "Internal error" : err instanceof Error ? err.message : "Unknown error";
    return Response.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
