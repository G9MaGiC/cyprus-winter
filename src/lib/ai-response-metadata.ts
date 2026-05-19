import { getPlaceById } from "@/data";
import { routing } from "@/i18n/routing";
import { sanitizeText } from "@/lib/sanitize";
import type { PlaceCard, ResponseAction, ResponseMetadata } from "@/lib/concierge/types";

const MAX_CARDS = 6;
const MAX_ACTIONS = 6;
const MAX_FOLLOW_UPS = 6;
const CARD_TYPES = new Set<PlaceCard["type"]>(["place", "trail", "event", "winery"]);
const ACTION_TYPES = new Set<ResponseAction["type"]>([
  "open_place",
  "save_to_plan",
  "show_on_map",
  "view_events",
  "book_now",
  "build_day_plan",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (path.length > 256) return false;
  return true;
}

function stripLocalePrefix(path: string): string {
  const localePattern = routing.locales.join("|");
  const match = path.match(new RegExp(`^/(${localePattern})(/|$)`));
  if (!match) return path;
  return path.slice(match[1].length + 1) || "/";
}

function normalizeActionPath(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const path = stripLocalePrefix(sanitizeText(raw, 256));
  return isSafeInternalPath(path) ? path : undefined;
}

function sanitizeCards(rawCards: unknown): PlaceCard[] | undefined {
  if (!Array.isArray(rawCards)) return undefined;
  const cards = rawCards
    .slice(0, MAX_CARDS)
    .map((raw): PlaceCard | null => {
      if (!isObject(raw)) return null;
      const id = typeof raw.id === "string" ? sanitizeText(raw.id, 128) : "";
      const place = id ? getPlaceById(id) : undefined;
      if (!place) return null;

      const rawType = typeof raw.type === "string" ? raw.type : "";
      const type = CARD_TYPES.has(rawType as PlaceCard["type"])
        ? (rawType as PlaceCard["type"])
        : place.type === "trail" || place.type === "event" || place.type === "winery"
          ? place.type
          : "place";
      const title = typeof raw.title === "string" ? sanitizeText(raw.title, 120) : place.name;
      const reason = typeof raw.reason === "string" ? sanitizeText(raw.reason, 180) : "";
      if (!title || !reason) return null;
      return { type, id, title, reason };
    })
    .filter((card): card is PlaceCard => Boolean(card));
  return cards.length > 0 ? cards : undefined;
}

function sanitizeActions(rawActions: unknown): ResponseAction[] | undefined {
  if (!Array.isArray(rawActions)) return undefined;
  const actions = rawActions
    .slice(0, MAX_ACTIONS)
    .map((raw): ResponseAction | null => {
      if (!isObject(raw)) return null;
      const type = typeof raw.type === "string" ? raw.type : "";
      if (!ACTION_TYPES.has(type as ResponseAction["type"])) return null;
      const label = typeof raw.label === "string" ? sanitizeText(raw.label, 80) : "";
      if (!label) return null;

      const payload = isObject(raw.payload) ? raw.payload : {};
      const path = normalizeActionPath(payload.path);
      return path
        ? { type: type as ResponseAction["type"], label, payload: { path } }
        : { type: type as ResponseAction["type"], label };
    })
    .filter((action): action is ResponseAction => Boolean(action));
  return actions.length > 0 ? actions : undefined;
}

function sanitizeFollowUps(rawFollowUps: unknown): string[] | undefined {
  if (!Array.isArray(rawFollowUps)) return undefined;
  const followUps = rawFollowUps
    .slice(0, MAX_FOLLOW_UPS)
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeText(item, 100))
    .filter(Boolean);
  return followUps.length > 0 ? followUps : undefined;
}

export function sanitizeResponseMetadata(raw: unknown): ResponseMetadata | undefined {
  if (!isObject(raw)) return undefined;
  const metadata: ResponseMetadata = {};
  const cards = sanitizeCards(raw.cards);
  const actions = sanitizeActions(raw.actions);
  const followUps = sanitizeFollowUps(raw.followUps);

  if (cards) metadata.cards = cards;
  if (actions) metadata.actions = actions;
  if (followUps) metadata.followUps = followUps;

  return metadata.cards || metadata.actions || metadata.followUps ? metadata : undefined;
}
