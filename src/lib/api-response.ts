/**
 * Consistent API response helpers.
 * Errors: `{ error: { code, message, details? }, message }`.
 * Successes: prefer `jsonSuccess` → `{ ok: true, ...fields }` (ad hoc shapes remain valid where clients already expect them).
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_TRANSITION"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export class RequestBodyTooLargeError extends Error {
  constructor(readonly maxBytes: number) {
    super(`Request body exceeds ${maxBytes} bytes.`);
    this.name = "RequestBodyTooLargeError";
  }
}

/** Read and parse JSON without buffering an unbounded request body. */
export async function readJsonBody<T = unknown>(
  req: Request,
  maxBytes = 256_000
): Promise<T> {
  const contentLengthHeader = req.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : Number.NaN;
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestBodyTooLargeError(maxBytes);
  }

  const reader = req.body?.getReader();
  if (!reader) {
    const text = await req.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new RequestBodyTooLargeError(maxBytes);
    }
    return JSON.parse(text) as T;
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new RequestBodyTooLargeError(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: ApiErrorDetail[]
): Response {
  const body = {
    error: {
      code,
      message,
      ...(details?.length ? { details } : {}),
    },
    message, // Top-level for clients that expect data.message or data.error (string)
  };
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Success helper. Contract is `{ ok: true, ...fields }` (not `{ success, data }`).
 * Prefer this for ok-only / ok+payload routes; keep route-specific shapes when clients already expect them.
 */
export function jsonSuccess(
  data: Record<string, unknown> = {},
  init?: { status?: number; headers?: Record<string, string> }
): Response {
  return Response.json(
    { ...data, ok: true as const },
    {
      status: init?.status ?? 200,
      headers: {
        "Cache-Control": "no-store",
        ...init?.headers,
      },
    }
  );
}

/** 429 response with Retry-After and X-RateLimit headers. */
export function jsonRateLimited(
  message: string,
  retryAfterSeconds: number
): Response {
  return Response.json(
    {
      error: { code: "RATE_LIMITED" as const, message },
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(Math.ceil(retryAfterSeconds)),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/** 429 response with standard headers when rate limit result available. */
export function jsonRateLimitedFromResult(
  message: string,
  resetAt: number
): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return jsonRateLimited(message, retryAfter);
}

/** Headers for successful rate-limited responses (200). Include on all rate-limited routes. */
export function rateLimitSuccessHeaders(
  remaining: number,
  limit: number,
  bypassed?: boolean
): Record<string, string> {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Limit": String(limit),
  };
  if (bypassed) {
    headers["X-RateLimit-Bypassed"] = "true";
  }
  return headers;
}
