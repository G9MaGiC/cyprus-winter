/** Intents the orchestrator can classify */
export type Intent =
  | "plan_trip"
  | "plan_today"
  | "discover"
  | "weather_adapted"
  | "nearby"
  | "booking"
  | "trails_outdoor"
  | "airport_arrival"
  | "search_compare"
  | "account_navigation"
  | "general";

/** User intent captured during onboarding */
export type OnboardingIntent = "planning" | "exploring" | "browsing";

/** Context payload assembled server-side each turn */
export type ConciergeContext = {
  locale: string;
  path?: string;
  lastPlace?: string;
  itinerary?: { day: number; placeIds: string[] }[];
  currentLocation?: { lat: number; lng: number };
  tripDates?: { start: string; end: string };
  tripStage?: "pre_trip" | "during_trip" | "post_trip";
  weatherSummary?: string;
  season: "winter";
  /** Onboarding intent — allows concierge to personalize from first interaction */
  userOnboardingIntent?: OnboardingIntent;
};

/** Result from any tool execution */
export type ToolResult = {
  tool: string;
  data: unknown;
};

/** A place card in the response */
export type PlaceCard = {
  type: "place" | "trail" | "event" | "winery";
  id: string;
  title: string;
  reason: string;
};

/** An action button in the response */
export type ResponseAction = {
  type: "open_place" | "save_to_plan" | "show_on_map" | "view_events" | "book_now" | "build_day_plan";
  label: string;
  payload?: Record<string, unknown>;
};

/** Structured metadata parsed from LLM response suffix */
export type ResponseMetadata = {
  cards?: PlaceCard[];
  actions?: ResponseAction[];
  followUps?: string[];
};

/** Full orchestrator output before LLM call */
export type OrchestratorResult = {
  intents: Intent[];
  toolResults: ToolResult[];
  systemPrompt: string;
  contextBlock: string;
};
