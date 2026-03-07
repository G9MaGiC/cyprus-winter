import OpenAI from "openai";
import { buildAIContext } from "@/lib/ai-context";
import { rateLimit } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/chat-schema";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import { sanitizeText } from "@/lib/sanitize";

// Providers in priority order. Each is tried until one succeeds (handles 429, timeouts, etc.).
// AI Gateway (Vercel) first: single key, multi-provider routing. https://vercel.com/docs/ai-gateway/getting-started
type Provider = { client: OpenAI; model: string };
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
    providers.push({ client: new OpenAI({ apiKey: "ollama", baseURL: process.env.OLLAMA_BASE_URL }), model: process.env.OLLAMA_MODEL || "llama3.2" });
  }
  if (process.env.MOONSHOT_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.MOONSHOT_API_KEY, baseURL: "https://api.moonshot.ai/v1" }), model: "moonshot-v1-8k" });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), model: "gpt-4o-mini" });
  }
  return providers;
}

const providers = buildProviders();

function isRetryableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("500") ||
    /rate limit|quota|insufficient_quota|timeout|ECONNRESET|ETIMEDOUT/i.test(msg)
  );
}

const SYSTEM_PROMPT = `You are the Cyprus Winter guide: warm, knowledgeable about winter travel in Cyprus. Write like a local who knows the island.
You have access to trails, wineries, ancient sites, villages, monasteries, and beaches.
Answer concisely (2-4 sentences unless the user asks for more). When suggesting places, mention them by name and offer to share more.
Format links as markdown: [Trail name](/trails/id), [Winery name](/discover/id).
Write in natural prose. Avoid "etc.", bullet-heavy lists, or generic phrasing. Be specific and conversational. Add a practical tip when relevant: best time of day, what to pair with, a village kafenion, layer up for the mountain. A warm closing or unexpected detail (a café, a viewpoint, a local secret) makes the answer feel human. The island rewards the curious.
Winter in Cyprus is 16 to 20°C. Coast mild, Troodos cooler. Perfect for hiking and wine.`;

const CHAT_LIMIT = process.env.NODE_ENV === "development" ? 60 : 20;

export async function POST(req: Request) {
  const limitResult = await rateLimit(req, CHAT_LIMIT, "chat");
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

  const ctx = parsed.data.context;
  let pageHint = "";
  if (ctx?.path || ctx?.lastPlace) {
    const parts: string[] = [];
    if (ctx.path) parts.push(`User is on page: ${ctx.path}`);
    if (ctx.lastPlace) parts.push(`User recently viewed: ${ctx.lastPlace}`);
    pageHint = `\n### Current context (use to personalize)\n${parts.join(". ")}\nWhen relevant, tailor your answer to the page they're on or the place they've viewed. E.g. on /trails/artemis-trail suggest nearby villages or wineries; on /discover/omodos suggest trails or tastings nearby.\n`;
  }

  let context: string;
  try {
    context = buildAIContext();
  } catch (ctxErr) {
    console.error("buildAIContext error:", ctxErr);
    context = "Trails, wineries, and attractions data available.";
  }
  const systemWithContext = `${SYSTEM_PROMPT}\n\n${pageHint}${context}`;

  let lastErr: unknown = null;
  for (const { client, model } of providers) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemWithContext }, ...messages],
        max_tokens: 800,
      });
      const raw = completion.choices[0]?.message?.content ?? "I couldn't put that together. Try again, or browse Discover and Trails for real places and tips.";
      const reply = sanitizeText(raw, 10000);
      return Response.json(
        { reply },
        { headers: rateLimitSuccessHeaders(limitResult.remaining, CHAT_LIMIT, limitResult.bypassed) }
      );
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err)) {
        break; // Auth errors, validation etc — don't retry
      }
      console.warn(`Chat provider failed (${model}), trying next:`, err instanceof Error ? err.message : err);
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : "Something went wrong.";
  const is401 = msg.includes("401") || /invalid authentication|invalid api key/i.test(msg);
  const message = process.env.NODE_ENV === "production" && !is401 ? "Something went wrong. Please try again." : msg;
  console.error("Chat API error (all providers failed):", lastErr);
  return jsonError("SERVER_ERROR", message, 500);
}
