import { getLiveWeather } from "@/lib/weather-live";

export const dynamic = "force-dynamic";

export async function GET() {
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
