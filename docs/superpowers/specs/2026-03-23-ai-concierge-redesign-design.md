# AI Concierge Redesign — Design Spec

## Overview

Redesign the Cyprus Winter AI assistant from a simple prompt-based Q&A guide into a tool-using RAG concierge that drives users toward concrete travel actions. The redesign addresses three problems simultaneously: users chat but don't convert, the assistant fabricates data it doesn't have, and users lack proactive guidance based on their situation.

## Architecture

### Three-Layer Tool-Using RAG Assistant

**Layer 1: Orchestrator**
Classifies each user message into one or more intents:

| Intent | Example triggers |
|--------|-----------------|
| Plan trip | "Plan 3 days in Cyprus", "Make me a wine itinerary" |
| Plan today | "What should I do today?", "I landed at 2pm, what now?" |
| Discover | "Best villages near Paphos", "Hidden beaches" |
| Weather-adapted | "It's raining, what can we do?", "Too windy for the beach?" |
| Nearby | "What's near me?", "What can I visit within 30 minutes?" |
| Booking | "Book a winery for tomorrow", "Find a guide tour" |
| Trails & outdoor | "Easy winter hike", "Which trails are safe today?" |
| Airport arrival | "I just arrived in Larnaca", "How do I get to Limassol?" |
| Search / compare | "Ayia Napa or Paphos in winter?", "Best winery for couples?" |
| Account / navigation | "Where do I save this?", "How do I reset my password?" |

**Layer 2: Retrieval + Tools**
12 tools that query real data:

1. `search_places` — attractions, beaches, wineries, monasteries, villages, restaurants, landmarks
2. `search_trails` — hiking routes, safety-aware trail suggestions
3. `search_events` — seasonal events, date/region filtering
4. `get_weather` — seasonal weather data (MVP: static monthly averages from `src/data/weather.ts`; post-MVP: live forecast via weather API)
5. `get_place_details` — hours, tags, duration, booking links, coordinates
6. `search_bookings` — bookable wineries, guides, tours, availability
7. `build_itinerary` — structured itinerary suggestions
8. `save_to_plan` — adds items to /plan (user-initiated only)
9. `get_nearby_places` — coordinate + radius based discovery
10. `get_transport_options` — airport transfers, bus, taxi, drive estimates
11. `get_user_profile` — preferences, saved places, prior selections
12. `get_opening_status` — live or cached open/closed state

**Layer 3: Response Composer**
Builds the final answer using the system prompt's tone rules, the structured JSON response contract, and ranked retrieval results.

### Tool Execution Architecture

Tools are **server-side functions** called by the route handler, not LLM function-calling definitions. The orchestrator works as follows:

1. **Intent classification**: The LLM receives the user message + context payload and returns a structured intent with required tool calls (or the server classifies the intent deterministically from keywords/context as a faster path).
2. **Server-side tool execution**: The route handler calls the identified tools (e.g., `search_places`, `get_weather`) as async TypeScript functions. These return structured data.
3. **Context assembly**: Tool results are serialized and injected into the LLM's context as a "retrieved data" block alongside the system prompt and conversation history.
4. **Response generation**: The LLM generates the final response (streamed prose + structured JSON suffix) with the tool results as grounding data.

This is a **retrieve-then-generate** pattern, not an agentic tool-calling loop. The server orchestrates; the LLM composes. This approach works with all model providers since it does not require native function-calling support.

```
User message → Route handler
  → Classify intent (deterministic or LLM-assisted)
  → Execute tools server-side (parallel where possible)
  → Assemble context: system prompt + tool results + conversation
  → Stream LLM response to client
  → Client parses prose + JSON suffix
```

**Fallback for weak models**: When a capable model is unavailable, skip tool execution and fall back to the current prompt-only approach with static context injection. The route handler checks the active provider and branches accordingly.

### Tool Use Policy

- Use tools whenever the user asks for recommendations, planning, availability, nearby places, weather-adapted suggestions, events, trails, or bookings.
- Use `search_places` for destination and attraction discovery.
- Use `search_trails` for hiking-related requests.
- Use `search_events` for date-sensitive event requests.
- Use `get_weather` whenever weather may affect the answer.
- Use `get_nearby_places` when the user asks what is near them or when geolocation is available and relevant.
- Use `build_itinerary` when the user asks for a day plan, multi-day plan, or route.
- Use `search_bookings` when the user asks to reserve or compare bookable experiences.
- Use `save_to_plan` only after the user explicitly asks to save, add, or build inside their trip plan.
- If hours, prices, or live status are unavailable, never infer them.
- If multiple tools are relevant, gather the minimum useful context and then answer.
- Prefer app inventory and live app services over unsupported background knowledge.

## System Prompt

```
You are the Cyprus Winter in-app travel assistant. You help travelers discover places,
build itineraries, adapt plans to weather and timing, and move toward actions inside the app.

Be concise, practical, and personalized. Use app data and tools first. Never invent hours,
prices, event schedules, trail conditions, or booking availability. If uncertain, say so clearly.

Prefer 3 to 5 strong recommendations over long lists. When planning, organize suggestions
in a time-aware and geographically sensible order. When relevant, tailor suggestions to
weather, transport mode, trip stage, budget, and user interests.

Always act like a local travel concierge inside the product, not a generic chatbot.
```

### Behavior Rules

1. Be practical, concise, and personalized.
2. Use the provided app data and tools first. Do not rely on unsupported general world knowledge when app tools can answer.
3. Never invent business hours, prices, event schedules, trail conditions, or booking availability.
4. If information is missing or uncertain, say that clearly and continue with the best safe alternative.
5. Prefer recommendations that fit the user's current context: location, region, weather, time of day, transport mode, trip duration, interests, budget, group type.
6. When useful, explain why a recommendation fits the moment.
7. When the user asks for plans, return structured, time-aware suggestions rather than generic lists.
8. When the user seems ready to act, guide them toward app actions (save to plan, open place details, view trails, check events, book).
9. Do not overwhelm the user. Usually recommend 3 to 5 strong options.
10. For safety-related outdoor questions, be conservative. If trail or weather conditions are unclear, say so.
11. If the user's question is ambiguous, make the best helpful assumption from context instead of asking unnecessary follow-up questions.
12. Keep tone warm, competent, local, and calm.

### Personality

Adaptive — reads the user's tone and mirrors it. Casual with casual users, precise with planners. Adjusts warmth and opinion level to match. Initial baseline is warm-neutral; after 2–3 exchanges, calibrate to the user's style.

### Prompt Architecture (4 modular files)

| File | Purpose |
|------|---------|
| `system-assistant.md` | Identity, behavior, tone, trust rules |
| `developer-tool-policy.md` | Tool use, constraints, output format, ranking logic |
| `itinerary-planner.md` | Day/multi-day planning rules, geographic optimization |
| `recommendation-ranker.md` | Ranking formula, scoring weights, preference matching |

## Context Model

Structured JSON payload injected every turn:

```json
{
  "locale": "en",
  "user": {
    "authenticated": true,
    "name": "Andreas",
    "preferences": {
      "interests": ["wine", "villages", "nature"],
      "budget": "mid",
      "transport_mode": "car",
      "pace": "relaxed"
    }
  },
  "session": {
    "trip_stage": "during_trip",
    "current_region": "Limassol",
    "current_location": { "lat": 34.6786, "lng": 33.0413 },
    "arrival_airport": "LCA",
    "arrival_time": "2026-12-10T14:20:00+02:00",
    "travel_dates": { "start": "2026-12-10", "end": "2026-12-14" }
  },
  "environment": {
    "local_time": "2026-12-11T10:15:00+02:00",
    "weather_summary": "cool, partly cloudy, windy coast",
    "season": "winter"
  },
  "itinerary": {
    "saved_items": ["Kolossi Castle", "Omodos", "Kourion"],
    "day_plan_exists": true
  }
}
```

## Memory Design

Travel preference memory — not conversational recall. Used for ranking, not long chat history.

### Storage Strategy

**MVP**: Store preferences in localStorage alongside existing itinerary data. Preferences are inferred from user behavior (saved places, browsed categories, booking history) and optionally set via a lightweight preferences prompt on first chat interaction ("What brings you to Cyprus? Couple trip, family, solo adventure?").

**Post-MVP**: Sync to a `user_preferences` Supabase table for authenticated users. Schema mirrors the memory object below. Anonymous users continue using localStorage.

### Stored Fields

- Preferred categories
- Budget level
- Transport mode
- Mobility constraints
- Travel pace
- Favored regions
- Group type (family/couple/solo)
- Saved places
- Previous dislikes

### Memory Object

```json
{
  "user_id": "123",
  "preferences": {
    "interests": ["villages", "wine", "light hiking"],
    "budget": "mid",
    "transport_mode": "rental_car",
    "group_type": "couple",
    "pace": "relaxed"
  },
  "signals": {
    "disliked": ["crowded nightlife"],
    "liked_regions": ["Troodos", "Limassol"]
  }
}
```

## Retrieval Design

### Hybrid: Structured Database + Vector Search

**Phase 1 (MVP): Structured search only**
- Query the existing static TypeScript data files (`src/data/*.ts`) in-memory via server-side tool functions
- Filter by region, category, tags, coordinates (Haversine distance)
- No database migration required — ship fast on existing data

**Phase 2 (post-MVP): Migrate to Supabase + pgvector**
- Migrate static data into Supabase tables with the enriched metadata schema below
- Add pgvector column for editorial description embeddings
- Enable semantic search: "quiet hidden village with character", "romantic winery with views"
- Prerequisite: choose embedding model, create migration, write ingestion script

The tool function interfaces are designed so that swapping the Phase 1 in-memory backend for Phase 2 Supabase queries is a drop-in replacement — the tool signatures and return types stay the same.

### Indexed Entities

Places, Trails, Events, Itinerary templates, FAQs, Transport info, Airport info.

### Metadata Schema

```json
{
  "id": "place_123",
  "type": "winery",
  "region": "Limassol",
  "season_tags": ["winter"],
  "interest_tags": ["wine", "views", "couples"],
  "transport_tags": ["car_recommended"],
  "estimated_duration_min": 90,
  "indoor_outdoor": "mixed",
  "family_friendly": true,
  "budget_level": "mid"
}
```

### Ranking Formula

```
final_score =
  0.30 × semantic_match
+ 0.20 × distance_score
+ 0.15 × weather_fit
+ 0.10 × season_fit
+ 0.10 × preference_fit
+ 0.10 × availability_fit
+ 0.05 × editorial_priority
```

**MVP simplification**: For Phase 1 (in-memory data, no pgvector), the ranking uses a reduced formula:

```
mvp_score =
  0.35 × keyword_match       // simple text matching against names, descriptions, tags
+ 0.25 × distance_score      // Haversine distance (when user location available, else skip)
+ 0.15 × season_fit          // winter-friendly flag or tag match
+ 0.15 × category_match      // matches user's requested category/interest
+ 0.10 × editorial_priority  // hand-curated priority field on each entity
```

`semantic_match` (requires embeddings), `weather_fit` (requires live weather), `preference_fit` (requires stored profile), and `availability_fit` (requires live status) are added when their data sources come online in Phase 2.

**Data enrichment needed**: The existing static data files do not include `season_tags`, `indoor_outdoor`, `budget_level`, or `transport_tags`. These metadata fields must be added to the TypeScript data files as part of MVP implementation.

## Response Contract

### Wire Protocol: Streamed Text + JSON Suffix

The response is delivered via SSE in two phases:

1. **Streaming phase**: The `message` text streams as plain SSE chunks (`{ delta: content }`) — same as today. The user sees text appear in real time.
2. **Structured suffix**: After the message text completes, the server appends a final SSE event with `type: "metadata"` containing the `cards`, `actions`, and `follow_ups` as parsed JSON.

```
SSE stream:
  { "delta": "Here are 3 winter-" }
  { "delta": "friendly villages..." }
  ...
  { "type": "metadata", "cards": [...], "actions": [...], "follow_ups": [...] }
```

The LLM outputs the full response as: prose text, then a `---ACTIONS---` delimiter, then a JSON block. The route handler splits on the delimiter: it streams the prose portion as SSE text chunks, parses the JSON portion, and sends it as the final `metadata` event. If no delimiter is found (graceful degradation), the entire output streams as text with no metadata event.

### Full Response Schema

```json
{
  "message": "Here are 3 winter-friendly villages near Paphos that fit a relaxed day trip.",
  "cards": [
    {
      "type": "place",
      "id": "village_1",
      "title": "Kathikas",
      "reason": "Good base for village atmosphere and nearby wineries"
    }
  ],
  "actions": [
    { "type": "save_to_plan", "label": "Save all 3" },
    { "type": "show_on_map", "label": "View on map" }
  ],
  "follow_ups": [
    "Make this a half-day route",
    "Add a winery stop",
    "Show quieter options"
  ]
}
```

### Action Types

| Type | Purpose |
|------|---------|
| `open_place` | Navigate to place detail page |
| `save_to_plan` | Add item(s) to user's trip plan |
| `show_on_map` | Open map view centered on location(s) |
| `view_events` | Navigate to events page with filters |
| `book_now` | Open booking flow |
| `build_day_plan` | Trigger itinerary builder |

### Follow-up Chips

Suggested next actions rendered as tappable chips below the response. Examples: "Plan my day", "Show nearby wineries", "Indoor options", "Open now", "Save these".

### Output Style

- Default to short paragraphs or compact bullets
- For recommendations: place name, short reason, ideal visit context
- For itineraries: morning/afternoon/evening or specific times, geographic logic to reduce backtracking
- For comparisons: give a clear verdict
- For uncertain facts: explicitly label uncertainty

## Chat UI Changes

### Action Buttons

Rendered from the `actions` array in the JSON response. Appear below the message text after streaming completes.

### Place Cards

Rendered from the `cards` array. Compact cards showing place name, type icon, and reason. Tappable to navigate to detail page.

### Follow-up Chips

Rendered from `follow_ups`. Horizontal scrollable row of suggestion chips below actions. Tapping a chip sends it as a new user message.

### Contextual Opener

When chat opens, auto-generate a greeting based on:
- Current page (trails → trail suggestions, plan → itinerary review)
- Time of year (winter activities)
- User's itinerary state (empty → suggest starting, populated → suggest gaps)
- Locale (respond in user's language)

The opener uses the same JSON response format with optional cards and follow-up chips.

### Graceful Degradation

If JSON parsing fails, render the raw message text without cards/actions/chips. The text response alone must still be useful.

## Push Notifications (post-MVP)

Redesign push notification copy to match the concierge voice. This is architecturally separate from the chat redesign and ships after the core concierge is stable.

- Weather nudges: "Cool and clear in the Troodos tomorrow — perfect for Kaledonia trail"
- Event reminders: "Limassol Carnival starts Saturday. Worth catching the parade if you're nearby"
- Trail condition alerts: "Rain expected Thursday — mountain trails may be slippery"

Tone: warm, specific, action-suggestive. Never generic.

## Safety and Trust Rules

The assistant explicitly avoids:
- Inventing live availability, hours, or prices
- Unsafe hiking advice when conditions are unclear
- Overpromising transport timings
- Pretending to know user location without permission
- Giving medical or emergency advice beyond official guidance

For emergency-related queries: provide official emergency numbers and suggest official services. Keep the answer direct.

## Data Confidence Protocol

| Tier | Example | Presentation |
|------|---------|-------------|
| Known | Trail exists, difficulty rating, region | State as fact |
| Qualified | "Typically open 10–5 in winter" | Hedge language, suggest confirming |
| Unknown | Live weather, today's hours, current prices | Acknowledge gap, route to action/tool |

## Example Prompt Flows

### "Plan my day in Limassol"

Tools: `get_weather` → `get_user_profile` → `build_itinerary` → optional `search_places`

Behavior: factor weather, reduce travel time, balance attractions and food/wine, give 3-part daily plan, offer "save to trip".

### "I just landed in Larnaca"

Tools: `get_transport_options` → `get_weather` → `search_places` near corridor → optional `build_itinerary`

Returns: transfer options, quick arrival advice, first 2–3 realistic activities based on current time, CTA "start your trip plan".

### "Best winter villages near Paphos"

Tools: `search_places` → optional `get_weather`

Prioritize: scenic winter suitability, drive feasibility, authenticity, pairing with wineries or monasteries.

### "Find me an easy trail today"

Tools: `get_weather` → `search_trails` → optional `get_opening_status`

Be conservative if condition data is weak.

## Model Requirements

The tool-using architecture with 12 tools, structured JSON output, and ranking-aware responses requires a capable model. Weaker models in the current fallback chain (Llama 8B, Ollama local) cannot reliably perform multi-tool orchestration. The concierge mode should activate only when a capable model is available (Grok-3, GPT-4o-mini or better). When falling back to weaker models, use the simplified prompt-only approach (current behavior) as a degraded but functional mode.

## MVP Scope (v1)

Ship these 6 capabilities first:

1. Destination recommendations
2. Day planning
3. Weather-aware suggestions
4. Nearby discovery
5. Winery and guide booking assistance
6. Airport arrival support

Do not try to make it answer everything at launch.

### MVP Tools (7 of 12)

| Tool | MVP capability it serves | Data source |
|------|------------------------|-------------|
| `search_places` | Recommendations, nearby | In-memory query of `src/data/attractions.ts`, `wineries.ts`, etc. |
| `search_trails` | Recommendations, weather-aware | In-memory query of `src/data/trails.ts` |
| `search_events` | Recommendations | In-memory query of `src/data/events.ts` |
| `get_weather` | Weather-aware suggestions | Static monthly averages from `src/data/weather.ts` |
| `build_itinerary` | Day planning | Server-side function using places + trails + time constraints |
| `get_nearby_places` | Nearby discovery | Haversine distance filter on places with coordinates |
| `get_transport_options` | Airport arrival | Static transport data (existing `/airport` page content) |

### Post-MVP Tools (5 of 12)

| Tool | Prerequisite |
|------|-------------|
| `get_place_details` | Enriched metadata schema on all entities |
| `search_bookings` | Booking availability API or partner integration |
| `save_to_plan` | API endpoint wrapping localStorage/Supabase plan storage |
| `get_user_profile` | User preferences table in Supabase |
| `get_opening_status` | Live or cached hours data source |

### Intent-to-Tool Routing Matrix

| Intent | Primary tools | Secondary tools |
|--------|--------------|-----------------|
| Plan trip | `build_itinerary` | `search_places`, `get_weather` |
| Plan today | `build_itinerary`, `get_weather` | `search_places`, `get_nearby_places` |
| Discover | `search_places` | `get_weather` |
| Weather-adapted | `get_weather`, `search_places` | `search_trails` |
| Nearby | `get_nearby_places` | `get_weather` |
| Booking | `search_places` | `search_bookings` (post-MVP) |
| Trails & outdoor | `search_trails`, `get_weather` | `get_nearby_places` |
| Airport arrival | `get_transport_options` | `get_weather`, `search_places` |
| Search / compare | `search_places` | `search_trails`, `search_events` |
| Account / navigation | *(no tools — direct text response)* | |

### Chat Request Schema Changes

The current `chatRequestSchema` accepts: `locale`, `path`, `lastPlace`, `itinerary`. MVP adds:

```typescript
// New fields added to chat request
{
  currentLocation?: { lat: number; lng: number }  // from browser geolocation (with permission)
  tripDates?: { start: string; end: string }       // from itinerary if set
  tripStage?: 'pre_trip' | 'during_trip' | 'post_trip'  // inferred from dates vs current date
}
```

The full context model (user preferences, weather, environment) is assembled server-side by the route handler, not sent from the client.

## Implementation Split

| Layer | Responsibility |
|-------|---------------|
| System prompt | Identity, behavior, tone, trust rules |
| Developer prompt | Tool use, constraints, output format, ranking logic |
| Context injection | User, trip, weather, location, itinerary, locale |
| Retrieval layer | Places, trails, events, bookings, profile memory |
| UI action contract | Cards, follow-ups, plan actions, map actions |

## Example Final Responses

### "What should I do today near Limassol?"

> Here are 3 good options for today near Limassol, especially if you want a relaxed winter day:
>
> 1. **Kourion** — great archaeological stop, open setting, easy to pair with nearby views. Best for a morning visit with mild weather.
> 2. **Omodos** — one of the easiest village day trips from Limassol, good for strolling and lunch. Best for a slow afternoon inland.
> 3. **A nearby winery stop** — works well in cooler weather and pairs naturally with the Omodos route. Best for late afternoon.
>
> A simple plan would be Kourion first, Omodos for lunch and village time, then a winery before heading back.

### "It's windy, is the beach still worth it?"

> If the coast is windy today, I would avoid making the beach the main plan. Better choices: a village route inland, a winery visit, or an archaeological site with shorter outdoor exposure. If you want, I can suggest 3 wind-safer options near your area.

### "Book a winery for tomorrow"

When user context is rich enough (region, transport mode, group type are known from preferences):

> Based on your area, here are 2 wineries with tastings that work well for couples:
>
> 1. **Ktima Gerolemo** — small-batch wines, scenic terrace, 25 min from Limassol
> 2. **Vouni Panayia** — fuller tour with vineyard walk, 40 min drive
>
> *(action buttons: "Book Ktima Gerolemo", "Book Vouni Panayia", "See more options")*

When context is insufficient (new user, no preferences set), ask the minimum needed:

> I can help find a winery. Quick question — are you looking for just a tasting, or a full tour with lunch?
>
> *(follow-up chips: "Just tasting", "Full tour", "Surprise me")*

Per behavior rule #11: assume from context when possible, only clarify when the gap materially affects the recommendation.
