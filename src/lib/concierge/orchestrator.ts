import type { Intent, ConciergeContext, ToolResult, OrchestratorResult } from "./types";
import { classifyIntent } from "./intents";
import { searchPlaces } from "./tools/search-places";
import { searchTrails } from "./tools/search-trails";
import { searchEvents } from "./tools/search-events";
import { getWeather } from "./tools/get-weather";
import { getNearbyPlaces } from "./tools/get-nearby-places";
import { getTransportOptions } from "./tools/get-transport-options";
import { buildItinerary } from "./tools/build-itinerary";
import { buildSystemPrompt } from "./prompts/system-assistant";
import { DEVELOPER_TOOL_POLICY } from "./prompts/developer-tool-policy";

/** Intent → tool mapping */
const INTENT_TOOLS: Record<Intent, string[]> = {
  plan_trip: ["build_itinerary", "search_places", "get_weather"],
  plan_today: ["build_itinerary", "get_weather", "search_places", "get_nearby_places"],
  discover: ["search_places", "get_weather"],
  weather_adapted: ["get_weather", "search_places", "search_trails"],
  nearby: ["get_nearby_places", "get_weather"],
  booking: ["search_places"],
  trails_outdoor: ["search_trails", "get_weather", "get_nearby_places"],
  airport_arrival: ["get_transport_options", "get_weather", "search_places"],
  search_compare: ["search_places", "search_trails", "search_events"],
  account_navigation: [],
  general: [],
};

function extractRegion(message: string): string | undefined {
  const regions = ["Paphos", "Limassol", "Larnaca", "Troodos", "Ayia Napa", "Nicosia", "Famagusta", "Protaras"];
  const lower = message.toLowerCase();
  return regions.find((r) => lower.includes(r.toLowerCase()));
}

function extractMonth(message: string): string | undefined {
  const months = ["November", "December", "January", "February", "March", "April"];
  const lower = message.toLowerCase();
  return months.find((m) => lower.includes(m.toLowerCase()));
}

function extractAirportCode(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("larnaca") || lower.includes("lca")) return "LCA";
  if (lower.includes("paphos") || lower.includes("pfo")) return "PFO";
  return undefined;
}

function executeTool(
  toolName: string,
  message: string,
  context: ConciergeContext
): ToolResult | undefined {
  switch (toolName) {
    case "search_places":
      return {
        tool: "search_places",
        data: searchPlaces({
          query: message,
          region: extractRegion(message),
          season: "winter",
          userLocation: context.currentLocation,
          limit: 5,
        }),
      };
    case "search_trails":
      return {
        tool: "search_trails",
        data: searchTrails({
          query: message,
          region: extractRegion(message),
          season: "winter",
          limit: 5,
        }),
      };
    case "search_events":
      return {
        tool: "search_events",
        data: searchEvents({
          month: extractMonth(message),
          region: extractRegion(message),
        }),
      };
    case "get_weather":
      return {
        tool: "get_weather",
        data: getWeather({ month: extractMonth(message) ?? "January" }),
      };
    case "get_nearby_places":
      if (!context.currentLocation) return undefined;
      return {
        tool: "get_nearby_places",
        data: getNearbyPlaces({
          lat: context.currentLocation.lat,
          lng: context.currentLocation.lng,
          radiusKm: 30,
        }),
      };
    case "get_transport_options": {
      const code = extractAirportCode(message);
      if (!code) return undefined;
      return {
        tool: "get_transport_options",
        data: getTransportOptions({ airportCode: code }),
      };
    }
    case "build_itinerary": {
      const days = message.match(/(\d+)\s*(day|days)/i);
      return {
        tool: "build_itinerary",
        data: buildItinerary({
          region: extractRegion(message),
          days: days ? parseInt(days[1], 10) : 1,
          userLocation: context.currentLocation,
        }),
      };
    }
    default:
      return undefined;
  }
}

export function orchestrate(message: string, context: ConciergeContext): OrchestratorResult {
  const intents = classifyIntent(message, context);

  // Collect unique tool names from all matched intents
  const toolNames = new Set<string>();
  for (const intent of intents) {
    for (const tool of INTENT_TOOLS[intent] ?? []) {
      toolNames.add(tool);
    }
  }

  // Execute tools
  const toolResults: ToolResult[] = [];
  for (const toolName of toolNames) {
    const result = executeTool(toolName, message, context);
    if (result) {
      toolResults.push(result);
    }
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(context.locale);

  // Build context block from tool results
  let contextBlock = "";
  if (toolResults.length > 0) {
    contextBlock = "\n\n## Retrieved data (use this to ground your answer)\n\n";
    for (const tr of toolResults) {
      contextBlock += `### ${tr.tool}\n\`\`\`json\n${JSON.stringify(tr.data, null, 2)}\n\`\`\`\n\n`;
    }
  }

  // Add user context
  const ctxParts: string[] = [];
  if (context.path) ctxParts.push(`User is on page: ${context.path}`);
  if (context.lastPlace) ctxParts.push(`User recently viewed: ${context.lastPlace}`);
  if (context.currentLocation) {
    ctxParts.push(`User location: ${context.currentLocation.lat}, ${context.currentLocation.lng}`);
  }
  if (context.itinerary?.length) {
    const dayLines = context.itinerary
      .sort((a, b) => a.day - b.day)
      .map(({ day, placeIds }) => `Day ${day}: ${placeIds.join(", ")}`);
    ctxParts.push(`User's plan: ${dayLines.join("; ")}`);
  }
  if (context.tripDates) {
    ctxParts.push(`Trip dates: ${context.tripDates.start} to ${context.tripDates.end}`);
  }
  if (context.tripStage) {
    ctxParts.push(`Trip stage: ${context.tripStage}`);
  }

  if (ctxParts.length > 0) {
    contextBlock += `\n### User context\n${ctxParts.join("\n")}\n`;
  }

  return {
    intents,
    toolResults,
    systemPrompt: systemPrompt + "\n\n" + DEVELOPER_TOOL_POLICY,
    contextBlock,
  };
}
