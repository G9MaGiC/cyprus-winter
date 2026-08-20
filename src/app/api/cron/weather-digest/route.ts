import { NextRequest } from "next/server";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getLiveWeather } from "@/lib/weather-live";
import {
  getSubscribersForWeatherDigest,
  markWeatherPushSent,
  deletePushSubscription,
} from "@/lib/push-subscriptions";
import { sendPush, isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function buildDigestMessage(weather: { coast: { minC: number; maxC: number }; troodos: { minC: number; maxC: number } }): { title: string; body: string } {
  const coastMid = Math.round((weather.coast.minC + weather.coast.maxC) / 2);
  const troodosMid = Math.round((weather.troodos.minC + weather.troodos.maxC) / 2);

  const h = new Date().getHours();
  if (h >= 5 && h < 10) {
    return {
      title: "Cyprus Winter",
      body: `${coastMid}°C coast · ${troodosMid}°C Troodos. Good morning — trails often clear early.`,
    };
  }
  if (h >= 10 && h < 14) {
    return {
      title: "Cyprus Winter",
      body: `${coastMid}°C coast · ${troodosMid}°C Troodos. Midday warmth — wineries and ruins at their best.`,
    };
  }
  return {
    title: "Cyprus Winter",
    body: `${coastMid}°C coast · ${troodosMid}°C Troodos. Golden hour soon — check Right now for sunset spots.`,
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return jsonError("UNAUTHORIZED", "Unauthorized", 401);
  }

  try {
    const weather = await getLiveWeather();
    const { title, body } = weather
      ? buildDigestMessage(weather)
      : { title: "Cyprus Winter", body: "Check today's weather — coast and Troodos. Pack layers." };

    let pushesSent = 0;
    if (isPushConfigured()) {
      const subs = await getSubscribersForWeatherDigest();
      for (const row of subs) {
        const result = await sendPush(row.subscription, {
          title,
          body,
          url: "/weather",
        });
        if (result.ok) {
          await markWeatherPushSent(row.id);
          pushesSent++;
        } else if (result.expired) {
          await deletePushSubscription(row.id);
        }
      }
    }

    return jsonSuccess({
      pushesSent,
      weather: weather ? "live" : "fallback",
      updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Weather digest cron error:", err);
    const errorMsg =
      process.env.NODE_ENV === "production" ? "Internal error" : err instanceof Error ? err.message : "Unknown error";
    return jsonError("SERVER_ERROR", errorMsg, 500);
  }
}
