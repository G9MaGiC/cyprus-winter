import { getLiveWeather, getWeatherAtCoords } from "@/lib/weather-live";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, rateLimitSuccessHeaders } from "@/lib/api-response";

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
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat != null && lng != null) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const valid =
        !Number.isNaN(latNum) &&
        !Number.isNaN(lngNum) &&
        latNum >= -90 &&
        latNum <= 90 &&
        lngNum >= -180 &&
        lngNum <= 180;
      if (!valid) {
        return jsonError("VALIDATION_ERROR", "Invalid lat/lng", 400);
      }
      const weather = await getWeatherAtCoords(latNum, lngNum);
      if (weather) {
        return Response.json(weather, {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
            ...rateLimitSuccessHeaders(limitResult.remaining, WEATHER_LIMIT, limitResult.bypassed),
          },
        });
      }
    }
    const weather = await getLiveWeather();
    if (!weather) {
      return jsonError("SERVICE_UNAVAILABLE", "Weather unavailable", 503);
    }
    return Response.json(weather, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        ...rateLimitSuccessHeaders(limitResult.remaining, WEATHER_LIMIT, limitResult.bypassed),
      },
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return jsonError("SERVER_ERROR", "Weather unavailable", 500);
  }
}
