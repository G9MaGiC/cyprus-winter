import { NextRequest, NextResponse } from "next/server";
import { jsonError, jsonRateLimitedFromResult } from "@/lib/api-response";
import { ensurePartnerOverlaysLoaded, getPartnerOverlay, setPartnerOverlay } from "@/lib/partner-overlay";
import { isSafePartnerImageUrl } from "@/lib/partner-image-url";
import { isPartnerIdentity, requirePartner } from "@/lib/partner-auth";
import { rateLimit } from "@/lib/rate-limit";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function limitPartner(req: NextRequest, limit: number): Promise<Response | null> {
  let limitResult: RateLimitResult;
  try {
    limitResult = await rateLimit(req, limit, "partner");
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Rate limiting unavailable. Try again in a moment.", 503);
  }
  if (!limitResult.ok) {
    return jsonRateLimitedFromResult("Too many requests", limitResult.resetAt);
  }
  return null;
}

/** Current overlay for the signed-in partner (hours + local hero path). */
export async function GET(req: NextRequest) {
  const limited = await limitPartner(req, 60);
  if (limited) return limited;

  const partner = requirePartner(req);
  if (!isPartnerIdentity(partner)) return partner;

  await ensurePartnerOverlaysLoaded();
  return NextResponse.json({
    partner: {
      providerId: partner.providerId,
      providerName: partner.providerName,
      kind: partner.kind,
      email: partner.email,
    },
    overlay: getPartnerOverlay(partner.providerId) ?? {},
  });
}

/** Update winter hours and/or a local /images/cyprus hero path. Durable since migration 009 (write-through to partner_overlays). */
export async function PATCH(req: NextRequest) {
  const limited = await limitPartner(req, 20);
  if (limited) return limited;

  const partner = requirePartner(req);
  if (!isPartnerIdentity(partner)) return partner;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  if (typeof body !== "object" || body === null) {
    return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const patch: { openingHours?: string; imageUrl?: string } = {};
  if ("openingHours" in body) {
    if (typeof (body as { openingHours?: unknown }).openingHours !== "string") {
      return jsonError("VALIDATION_ERROR", "openingHours must be a string.", 400);
    }
    patch.openingHours = (body as { openingHours: string }).openingHours;
  }
  if ("imageUrl" in body) {
    if (typeof (body as { imageUrl?: unknown }).imageUrl !== "string") {
      return jsonError("VALIDATION_ERROR", "imageUrl must be a string.", 400);
    }
    const imageUrl = (body as { imageUrl: string }).imageUrl;
    if (!isSafePartnerImageUrl(imageUrl)) {
      return jsonError(
        "VALIDATION_ERROR",
        "imageUrl must be an existing /images/cyprus path (jpg, jpeg, png, or webp).",
        400
      );
    }
    patch.imageUrl = imageUrl.trim();
  }

  let overlay;
  try {
    overlay = await setPartnerOverlay(partner.providerId, patch);
  } catch {
    return jsonError("SERVICE_UNAVAILABLE", "Could not save your changes. Try again in a moment.", 503);
  }
  return NextResponse.json({ overlay });
}
