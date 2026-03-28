import type { Intent, ConciergeContext } from "./types";

type IntentPattern = {
  intent: Intent;
  patterns: RegExp[];
};

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: "airport_arrival",
    patterns: [
      /\b(land|landed|arriving|arrival|airport|larnaca airport|paphos airport|LCA|PFO)\b/i,
      /\bjust (got here|arrived|landed)\b/i,
      /\bhow (do I |to )?(get to|reach)\b/i,
    ],
  },
  {
    intent: "plan_trip",
    patterns: [
      /\bplan\b.*\b(\d+)\s*(day|week)/i,
      /\bitinerary\b/i,
      /\bmake me a .*(plan|itinerary|route)\b/i,
      /\b(multi[- ]?day|full trip)\b/i,
    ],
  },
  {
    intent: "plan_today",
    patterns: [
      /\btoday\b/i,
      /\bthis (morning|afternoon|evening)\b/i,
      /\bwhat (should|can) (I|we) do\b/i,
      /\bwhat now\b/i,
      /\bplan\b.{0,30}\bday\b/i,
    ],
  },
  {
    intent: "weather_adapted",
    patterns: [
      /\b(rain|rainy|raining|windy|wind|storm|cold|hot|cloudy|snow|snowing)\b/i,
      /\bweather\b/i,
      /\btoo (windy|cold|hot)\b/i,
    ],
  },
  {
    intent: "nearby",
    patterns: [
      /\bnear (me|here|my|us)\b/i,
      /\bnearby\b/i,
      /\bwithin \d+ (min|minute|km|kilometer)\b/i,
      /\bclose to (me|here|where I am)\b/i,
    ],
  },
  {
    intent: "booking",
    patterns: [
      /\b(book|reserve|reservation|booking)\b/i,
      /\bfind a (guide|tour)\b/i,
      /\bavailability\b/i,
    ],
  },
  {
    intent: "trails_outdoor",
    patterns: [
      /\b(trail|hike|hiking|walk|trek|trekking)\b/i,
      /\b(outdoor|nature walk|mountain)\b/i,
      /\b(artemis|atalante|caledonia|persephone|adonis) trail\b/i,
    ],
  },
  {
    intent: "discover",
    patterns: [
      /\b(best|top|hidden|secret|recommend)\b.*\b(villages?|beaches?|winer(y|ies)|monaster(y|ies)|ruins?|sites?|places?)\b/i,
      /\b(villages?|beaches?|winer(y|ies)|monaster(y|ies)|ancient site)\b.*\b(near|in|around)\b/i,
      /\bwhat (is|are) (the )?best\b/i,
      /\bshow me\b/i,
    ],
  },
  {
    intent: "search_compare",
    patterns: [
      /\bor\b.*\b(in winter|for|better|vs)\b/i,
      /\bcompare\b/i,
      /\bwhich (is|are) (better|best)\b/i,
      /\b(vs|versus)\b/i,
    ],
  },
  {
    intent: "account_navigation",
    patterns: [
      /\b(save|saved|account|login|sign|password|reset)\b/i,
      /\bhow (do I |to )?(find|use|navigate)\b/i,
    ],
  },
];

export function classifyIntent(message: string, _context: ConciergeContext): Intent[] {
  const matched: Intent[] = [];

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) {
      matched.push(intent);
    }
  }

  if (matched.length === 0) {
    matched.push("general");
  }

  return matched;
}
