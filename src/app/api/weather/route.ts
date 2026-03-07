import { getLiveWeather } from "@/lib/weather-live";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimitSuccessHeaders } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const WEATHER_LIMIT = 30;

export async function GET(req: Request) {
  const limitResult = await rateLimit(req, WEATHER_LIMIT, "weather");
  if (!limitResult.ok) {
    return Response.json(
      { error: { code: "RATE_LIMITED" as const, message: "Too many requests. Try again in a minute." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) },
      }
    );
  }
  try {
    const weather = await getLiveWeather();
    if (!weather) {
      return Response.json(
        { error: "Weather unavailable" },
        { status: 503 }
      );
    }
    return Response.json(weather, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        ...rateLimitSuccessHeaders(limitResult.remaining, WEATHER_LIMIT, limitResult.bypassed),
      },
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return Response.json(
      { error: "Weather unavailable" },
      { status: 500 }
    );
  }
}
