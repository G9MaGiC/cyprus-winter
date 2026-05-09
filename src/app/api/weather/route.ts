import { getLiveWeather, getWeatherAtCoords } from "@/lib/weather-live";
import { rateLimit, type RateLimitResult } from "@/lib/rate-limit";
import {
  jsonError,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

const WEATHER_LIMIT = 30;

export async function GET(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, WEATHER_LIMIT, "weather");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Too many requests. Try again in a minute.",
      limitResult.resetAt
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
