/**
 * Annex-safe slice of GET /api/health (public body only).
 * Never copies hints, env names, or bearer tokens from a detailed dump.
 */
export type AnnexPublicHealth = {
  ok: boolean;
  message: string;
  productionReady: boolean;
};

export function toAnnexPublicHealth(json: unknown): AnnexPublicHealth {
  if (!json || typeof json !== "object") {
    return { ok: false, message: "", productionReady: false };
  }
  const body = json as Record<string, unknown>;
  return {
    ok: body.ok === true,
    message: typeof body.message === "string" ? body.message.slice(0, 200) : "",
    productionReady: body.productionReady === true,
  };
}

export type AnnexHealthEvidence = {
  capturedAt: string;
  url: string;
  httpStatus: number;
  public: AnnexPublicHealth;
};

export function buildAnnexHealthEvidence(input: {
  capturedAt: Date;
  url: string;
  httpStatus: number;
  json: unknown;
}): AnnexHealthEvidence {
  return {
    capturedAt: input.capturedAt.toISOString(),
    url: input.url,
    httpStatus: input.httpStatus,
    public: toAnnexPublicHealth(input.json),
  };
}
