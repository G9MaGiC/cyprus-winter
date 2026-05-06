import OpenAI from "openai";
import { buildAIContext, buildAIContextRelevant } from "@/lib/ai-context";
import { getPlaceById } from "@/data";
import { rateLimit } from "@/lib/rate-limit";
import { chatRequestSchema, sanitizeChatMetadata } from "@/lib/chat-schema";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { orchestrate } from "@/lib/concierge/orchestrator";
import type { ConciergeContext } from "@/lib/concierge/types";

// Providers in priority order. Each is tried until one succeeds (handles 429, timeouts, etc.).
// AI Gateway (Vercel) first: single key, multi-provider routing. https://vercel.com/docs/ai-gateway/getting-started
type Provider = { client: OpenAI; model: string; isOllama?: boolean };
function buildProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.AI_GATEWAY_API_KEY) {
    const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini";
    providers.push({
      client: new OpenAI({
        apiKey: process.env.AI_GATEWAY_API_KEY,
        baseURL: "https://ai-gateway.vercel.sh/v1",
      }),
      model,
    });
  }
  if (process.env.XAI_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" }), model: "grok-3-mini" });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" }), model: "llama-3.1-8b-instant" });
  }
  if (process.env.OLLAMA_BASE_URL) {
    const ollamaTimeout = Number(process.env.OLLAMA_TIMEOUT_MS) || 60000;
    providers.push({
      client: new OpenAI({
        apiKey: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL,
        timeout: ollamaTimeout,
      }),
      model: process.env.OLLAMA_MODEL || "llama3.2",
      isOllama: true,
    });
  }
  if (process.env.MOONSHOT_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.MOONSHOT_API_KEY, baseURL: "https://api.moonshot.ai/v1" }), model: "moonshot-v1-8k" });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), model: "gpt-4o-mini" });
  }
  // In development, when Ollama is configured, try it first (local inference)
  if (process.env.NODE_ENV === "development" && process.env.OLLAMA_BASE_URL) {
    const ollamaIdx = providers.findIndex((p) => p.isOllama);
    if (ollamaIdx > 0) {
      const [ollama] = providers.splice(ollamaIdx, 1);
      providers.unshift(ollama);
    }
  }
  return providers;
}

const providers = buildProviders();

function isCapableProvider(provider: Provider): boolean {
  const weakModels = ["llama-3.1-8b-instant", "llama3.2", "moonshot-v1-8k"];
  return !weakModels.includes(provider.model) && !provider.isOllama;
}

function getOllamaModelNotFoundHint(err: unknown, model: string): string | null {
  const msg = err instanceof Error ? err.message : String(err);
  if (/model.*not found|not found.*model/i.test(msg)) {
    return ` Run: ollama pull ${model}`;
  }
  return null;
}

function isRetryableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("500") ||
    /rate limit|quota|insufficient_quota|timeout|ECONNRESET|ETIMEDOUT/i.test(msg)
  );
}

const SYSTEM_PROMPT_BASE = `You are the Cyprus Winter guide: warm, knowledgeable about winter travel in Cyprus. Write like a local who knows the island.
You have access to trails, wineries, ancient sites, villages, monasteries, and beaches.
Answer concisely (2-4 sentences unless the user asks for more). When suggesting places, mention them by name and offer to share more.
Format links as markdown: [Trail name](/trails/id), [Winery name](/discover/id).
Write in natural prose. Avoid "etc.", bullet-heavy lists, or generic phrasing. Be specific and conversational. Add a practical tip when relevant: best time of day, what to pair with, a village kafenion, layer up for the mountain. A warm closing or unexpected detail (a café, a viewpoint, a local secret) makes the answer feel human. The island rewards the curious.
Winter in Cyprus is 16 to 20°C. Coast mild, Troodos cooler. Perfect for hiking and wine.`;

function buildSystemPrompt(locale?: string): string {
  const langHint =
    locale && locale !== "en"
      ? `\n\nLanguage: If the user writes in German, Greek, or Polish, respond in the same language. Otherwise write in English.`
      : "";
  return SYSTEM_PROMPT_BASE + langHint;
}

const CHAT_LIMIT = process.env.NODE_ENV === "development" ? 60 : 20;

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (path.length > 256) return false;
  return true;
}

function normalizeChatContext(ctx: unknown) {
  if (!ctx || typeof ctx !== "object") return {};
  const obj = ctx as Record<string, unknown>;

  const pathRaw = typeof obj.path === "string" ? sanitizeText(obj.path, 256) : undefined;
  const path = pathRaw && isSafeInternalPath(pathRaw) ? pathRaw : undefined;

  const lastPlaceRaw = typeof obj.lastPlace === "string" ? sanitizeText(obj.lastPlace, 128) : undefined;
  const lastPlace = lastPlaceRaw && getPlaceById(lastPlaceRaw) ? lastPlaceRaw : undefined;

  const itineraryRaw = Array.isArray(obj.itinerary) ? obj.itinerary : undefined;
  const itinerary =
    itineraryRaw
      ?.slice(0, 14)
      .map((e) => {
        if (!e || typeof e !== "object") return null;
        const entry = e as Record<string, unknown>;
        const day = typeof entry.day === "number" ? entry.day : NaN;
        const placeIds = Array.isArray(entry.placeIds) ? entry.placeIds : [];
        const normalizedIds = placeIds
          .filter((id): id is string => typeof id === "string")
          .slice(0, 20)
          .map((id) => sanitizeText(id, 128))
          .filter((id) => Boolean(id) && Boolean(getPlaceById(id)));
        if (!Number.isInteger(day) || day < 1 || day > 14) return null;
        if (normalizedIds.length === 0) return null;
        return { day, placeIds: normalizedIds };
      })
      .filter((e): e is { day: number; placeIds: string[] } => Boolean(e)) ?? undefined;

  const locale = typeof obj.locale === "string" ? obj.locale : undefined;

  return { path, lastPlace, itinerary, locale };
}

export async function POST(req: Request) {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, CHAT_LIMIT, "chat");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait a moment before trying again.",
      limitResult.resetAt
    );
  }

  if (providers.length === 0) {
    return jsonError(
      "SERVICE_UNAVAILABLE",
      "Add AI_GATEWAY_API_KEY, XAI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, MOONSHOT_API_KEY, or OPENAI_API_KEY to your .env.local.",
      503
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "messages array is required";
    return jsonError("VALIDATION_ERROR", msg, 400, [{ field: "messages", message: msg }]);
  }

  const messages = parsed.data.messages.map((m) => ({
    role: m.role,
    content: sanitizeText(m.content, 10000),
  }));

  const ctx = normalizeChatContext(parsed.data.context);

  // Build concierge context (capable providers)
  const rawCtx = parsed.data.context as Record<string, unknown> | undefined;
  const conciergeCtx: ConciergeContext = {
    locale: ctx?.locale ?? "en",
    path: ctx?.path,
    lastPlace: ctx?.lastPlace,
    itinerary: ctx?.itinerary,
    currentLocation: rawCtx?.currentLocation as { lat: number; lng: number } | undefined,
    tripDates: rawCtx?.tripDates as { start: string; end: string } | undefined,
    tripStage: rawCtx?.tripStage as "pre_trip" | "during_trip" | "post_trip" | undefined,
    season: "winter",
  };

  // Legacy context builder (weak providers)
  const buildLegacySystemWithContext = (): string => {
    const parts: string[] = [];
    if (ctx?.path) parts.push(`User is on page: ${ctx.path}`);
    if (ctx?.lastPlace) parts.push(`User recently viewed: ${ctx.lastPlace}`);
    if (ctx?.itinerary?.length) {
      const dayLines = ctx.itinerary
        .sort((a, b) => a.day - b.day)
        .map(({ day, placeIds }) => {
          const names = placeIds
            .map((id) => getPlaceById(id)?.name ?? id)
            .filter(Boolean);
          return `Day ${day}: ${names.join(", ")}`;
        });
      parts.push(`User's plan: ${dayLines.join("; ")}. Use this to suggest nearby places, timing, route tips, or pairing ideas.`);
    }
    const pageHint = parts.length
      ? `\n### Current context (use to personalize)\n${parts.join(". ")}\nWhen relevant, tailor your answer to the page they're on, the place they've viewed, or their plan.\n`
      : "";

    let context: string;
    try {
      const itineraryIds = ctx?.itinerary?.flatMap((e) => e.placeIds) ?? [];
      context = buildAIContextRelevant({
        path: ctx?.path,
        lastPlace: ctx?.lastPlace,
        itineraryPlaceIds: itineraryIds.length > 0 ? itineraryIds : undefined,
      });
    } catch (ctxErr) {
      console.error("buildAIContextRelevant error:", ctxErr);
      try {
        context = buildAIContext();
      } catch {
        context = "Trails, wineries, and attractions data available.";
      }
    }
    return `${buildSystemPrompt(ctx?.locale)}\n\n${pageHint}${context}`;
  };

  const encoder = new TextEncoder();
  const baseHeaders: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    ...rateLimitSuccessHeaders(limitResult.remaining, CHAT_LIMIT, limitResult.bypassed),
  };

  const sendStream = (stream: ReadableStream) =>
    new Response(stream, { headers: baseHeaders });

  const emitChunk = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;

  const lastUserMessage = messages[messages.length - 1]?.content ?? "";
  const delimiter = "---ACTIONS---";

  let lastErr: unknown = null;
  let lastProvider: Provider | null = null;
  for (const provider of providers) {
    const { client, model } = provider;
    const capable = isCapableProvider(provider);

    const systemWithContext = capable
      ? (() => {
          const { systemPrompt, contextBlock } = orchestrate(lastUserMessage, conciergeCtx);
          return `${systemPrompt}\n\n${contextBlock}`;
        })()
      : buildLegacySystemWithContext();

    const apiMessages = [{ role: "system" as const, content: systemWithContext }, ...messages];

    // Try streaming first
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: apiMessages,
        max_tokens: 800,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            if (capable) {
              // Delimiter-aware streaming: buffer full response, split on ---ACTIONS---
              let fullContent = "";
              let sentProseUpTo = 0;

              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  const delimIdx = fullContent.indexOf(delimiter);
                  if (delimIdx === -1) {
                    const toSend = fullContent.slice(sentProseUpTo);
                    if (toSend) {
                      controller.enqueue(encoder.encode(emitChunk({ delta: toSend })));
                      sentProseUpTo = fullContent.length;
                    }
                  }
                }
              }

              // Flush remaining prose and optional metadata
              const delimIdx = fullContent.indexOf(delimiter);
              if (delimIdx !== -1) {
                const unseenProse = fullContent.slice(sentProseUpTo, delimIdx).trim();
                if (unseenProse) {
                  controller.enqueue(encoder.encode(emitChunk({ delta: unseenProse })));
                }
                const jsonStr = fullContent.slice(delimIdx + delimiter.length).trim();
                try {
                  const metadata = sanitizeChatMetadata(JSON.parse(jsonStr));
                  if (metadata) {
                    controller.enqueue(encoder.encode(emitChunk({ type: "metadata", ...metadata })));
                  }
                } catch {
                  // Malformed JSON — skip metadata
                }
              }
            } else {
              // Legacy streaming: pass through chunks directly
              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(emitChunk({ delta: content })));
                }
              }
            }

            controller.enqueue(encoder.encode(emitChunk({ done: true })));
            controller.close();
          } catch (streamErr) {
            const msg = streamErr instanceof Error ? streamErr.message : String(streamErr);
            const safeMessage =
              process.env.NODE_ENV === "production"
                ? "Something went wrong. Please try again."
                : msg;
            controller.enqueue(encoder.encode(emitChunk({ error: safeMessage })));
            controller.close();
          }
        },
      });
      return sendStream(stream);
    } catch (err) {
      if (!isRetryableError(err)) {
        lastErr = err;
        lastProvider = provider;
        break;
      }
      // Fall back to non-streaming for this provider
      try {
        const completion = await client.chat.completions.create({
          model,
          messages: apiMessages,
          max_tokens: 800,
        });
        const raw = completion.choices[0]?.message?.content ?? "I couldn't put that together. Try again, or browse Discover and Trails for real places and tips.";
        const reply = sanitizeText(raw, 10000);

        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(emitChunk({ delta: reply })));
            controller.enqueue(encoder.encode(emitChunk({ done: true })));
            controller.close();
          },
        });
        return sendStream(stream);
      } catch (fallbackErr) {
        lastErr = fallbackErr;
        lastProvider = provider;
        console.warn(`Chat provider failed (${model}), trying next:`, err instanceof Error ? err.message : err);
      }
    }
  }

  let msg = lastErr instanceof Error ? lastErr.message : "Something went wrong.";
  if (lastProvider?.isOllama) {
    const hint = getOllamaModelNotFoundHint(lastErr, lastProvider.model);
    if (hint) msg += hint;
  }
  const is401 = msg.includes("401") || /invalid authentication|invalid api key/i.test(msg);
  const message = process.env.NODE_ENV === "production" && !is401 ? "Something went wrong. Please try again." : msg;
  console.error("Chat API error (all providers failed):", lastErr);
  return jsonError("SERVER_ERROR", message, 500);
}
