import { createTrailReport } from "@/lib/trail-reports";
import { rateLimit } from "@/lib/rate-limit";
import { trails } from "@/data/trails";
import { z } from "zod";
import {
  jsonError,
  jsonRateLimitedFromResult,
  rateLimitSuccessHeaders,
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/api-response";
import type { RateLimitResult } from "@/lib/rate-limit";
import { sanitizeForStorage } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32_000;

const reportSchema = z.object({
  trailId: z.string().min(1).max(100),
  status: z.enum(["open", "caution", "closed"]),
  surface: z.enum(["dry", "muddy", "snow", "icy"]),
  note: z.string().max(500).optional(),
  temperatureC: z.number().int().min(-10).max(40).optional(),
  windKmh: z.number().int().min(0).max(150).optional(),
  reporterEmail: z.string().email().max(254).optional(),
  // Deliberately absent from the UI. Non-empty values are treated as bot submissions.
  website: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError("PAYLOAD_TOO_LARGE", "Report payload is too large.", 413);
  }

  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, 10, "trail-reports");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult(
      "Too many reports. Please wait before submitting another.",
      limitResult.resetAt
    );
  }

  try {
    let body: unknown;
    try {
      body = await readJsonBody(req, MAX_BODY_BYTES);
    } catch (err) {
      if (err instanceof RequestBodyTooLargeError) {
        return jsonError("PAYLOAD_TOO_LARGE", "Report payload is too large.", 413);
      }
      return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }

    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return jsonError("VALIDATION_ERROR", msg, 400);
    }

    // Return a generic success to bots so the endpoint does not become an oracle.
    if (parsed.data.website?.trim()) {
      return Response.json(
        {
          report: null,
          stored: false,
          message: "Thanks for the report. It helps other hikers.",
        },
        { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
      );
    }

    const { trailId } = parsed.data;
    const trail = trails.find((t) => t.id === trailId || t.slug === trailId);
    if (!trail) {
      return jsonError("NOT_FOUND", "Trail not found", 404);
    }

    const note = parsed.data.note != null ? sanitizeForStorage(parsed.data.note) : undefined;
    const reporterEmail = parsed.data.reporterEmail != null ? sanitizeForStorage(parsed.data.reporterEmail) : undefined;

    const { report, stored } = await createTrailReport({
      trailId: trail.id,
      status: parsed.data.status,
      surface: parsed.data.surface,
      note: note || undefined,
      temperatureC: parsed.data.temperatureC,
      windKmh: parsed.data.windKmh,
      reporterEmail: reporterEmail || undefined,
    });

    return Response.json(
      {
        report,
        stored,
        message: stored
          ? "Thanks for the report. It helps other hikers."
          : "Thanks — we couldn't save your report right now. Conditions on the trail page may not update until storage is available.",
      },
      { headers: rateLimitSuccessHeaders(limitResult.remaining, 10, limitResult.bypassed) }
    );
  } catch (err) {
    console.error("Trail report API error:", err);
    return jsonError(
      "SERVER_ERROR",
      "We couldn't save your report. Please try again.",
      500
    );
  }
}
