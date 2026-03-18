export type ApiErrorEnvelope = {
  error?: { code?: string; message?: string };
  message?: string;
};

export async function safeJson(res: Response): Promise<unknown> {
  return await res.json().catch(() => ({}));
}

export function getApiErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const err = (data as ApiErrorEnvelope).error;
  return err && typeof err.code === "string" ? err.code : undefined;
}

export function getRetryAfterSeconds(res: Response): number | undefined {
  const ra = res.headers.get("Retry-After");
  if (!ra) return undefined;
  const n = Number(ra);
  return Number.isFinite(n) ? n : undefined;
}

