import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildAIContext } from "@/lib/ai-context";
import { rateLimit } from "@/lib/rate-limit";
import { chatRequestSchema } from "@/lib/chat-schema";
import { jsonError, jsonRateLimitedFromResult, rateLimitSuccessHeaders } from "@/lib/api-response";
import { sanitizeText } from "@/lib/sanitize";

const apiKey = process.env.MOONSHOT_API_KEY ?? "";
const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.moonshot.ai/v1",
    })
  : null;

const SYSTEM_PROMPT = `You are the Cyprus Winter AI assistant: helpful, warm, and knowledgeable about winter travel in Cyprus.
You have access to trails, wineries, ancient sites, villages, monasteries, and beaches.
Answer concisely (2-4 sentences unless the user asks for more). When suggesting places, mention them by name and offer to share more.
Format links as markdown: [Trail name](/trails/id), [Winery name](/discover/id).
Write in natural prose. Avoid "etc.", bullet-heavy lists, or generic phrasing. Be specific and conversational. Add a practical tip when relevant: best time of day, what to pair with, a village kafenion, layer up for the mountain. A warm closing or unexpected detail (a café, a viewpoint, a local secret) makes the answer feel human. The island rewards the curious.
Winter in Cyprus is 16 to 20°C. Coast mild, Troodos cooler. Perfect for hiking and wine.`;

export async function POST(req: NextRequest) {
  const limitResult = rateLimit(req, 20);
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Please wait a moment before trying again.",
      limitResult.resetAt
    );
  }

  if (!apiKey || !client) {
    return jsonError(
      "SERVICE_UNAVAILABLE",
      "Add MOONSHOT_API_KEY to your environment.",
      503
    );
  }

  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "messages array is required";
      return jsonError("VALIDATION_ERROR", msg, 400, [
        {
          field: "messages",
          message: msg,
        },
      ]);
    }
    const messages = parsed.data.messages.map((m) => ({
      role: m.role,
      content: sanitizeText(m.content, 10000),
    }));

    let context: string;
    try {
      context = buildAIContext();
    } catch (ctxErr) {
      console.error("buildAIContext error:", ctxErr);
      context = "Trails, wineries, and attractions data available.";
    }
    const systemWithContext = `${SYSTEM_PROMPT}\n\n${context}`;

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        { role: "system", content: systemWithContext },
        ...messages,
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content ?? "I couldn't put that together. Try again, or browse Discover and Trails for real places and tips.";

    return Response.json(
      { reply },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 20) }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    console.error("Chat API error:", err);
    return jsonError("SERVER_ERROR", message, 500);
  }
}
