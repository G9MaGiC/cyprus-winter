import type { Message } from "./hooks/useAIChat";

const SKILLS_CONTENT = `Here's what I can help with:

**Trip planning** — Build a day or multi-day itinerary tailored to your dates and region.

**Discover places** — Wineries, villages, beaches, ancient sites, monasteries.

**Trails & hiking** — Suggestions by difficulty, region, and winter conditions.

**Weather-adapted ideas** — What to do based on the forecast or your travel month.

**Nearby places** — Share your location and I'll find what's close.

**Airport arrival** — Transport from Larnaca or Paphos, first stops, opening-day tips.

**Search & compare** — Compare trails, wineries, and events across the island.

Just ask a question or tap a suggestion below to get started.`;

const SKILLS_FOLLOW_UPS = [
  "Plan my 3-day trip",
  "Best wineries near Limassol",
  "Easy winter hike",
  "I just landed in Larnaca",
];

/** Returns the assistant reply for a given slash command, or null if not a known command. */
export function handleSlashCommand(input: string): Message | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "/skills") {
    return {
      role: "assistant",
      content: SKILLS_CONTENT,
      metadata: { followUps: SKILLS_FOLLOW_UPS },
    };
  }
  return null;
}

/** Returns true if the input is a slash command (starts with /). */
export function isSlashCommand(input: string): boolean {
  return input.trim().startsWith("/");
}
