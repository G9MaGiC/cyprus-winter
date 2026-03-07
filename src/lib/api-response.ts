/**
 * Consistent API response helpers.
 * TECHNICAL.md: { error: { code, message, details? } } for errors.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "SERVER_ERROR"
  | "SERVICE_UNAVAILABLE";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

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
  return Response.json(body, { status });
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
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Limit": String(limit),
  };
  if (bypassed) {
    headers["X-RateLimit-Bypassed"] = "true";
  }
  return headers;
}
