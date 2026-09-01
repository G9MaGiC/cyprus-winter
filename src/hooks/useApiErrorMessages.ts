"use client";

import { useTranslations } from "next-intl";

/**
 * Localized messages for the booking API's error codes — one copy for both
 * booking forms (the mapping was previously duplicated in each form plus its
 * test fixture; a code added to only one silently fell back to the generic
 * message). Add new codes here and in `errors.api.*` ×7.
 */
export function useApiErrorMessages(): Record<string, string> {
  const tApiErrors = useTranslations("errors.api");
  return {
    VALIDATION_ERROR: tApiErrors("VALIDATION_ERROR"),
    BAD_REQUEST: tApiErrors("BAD_REQUEST"),
    RATE_LIMITED: tApiErrors("RATE_LIMITED"),
    SERVICE_UNAVAILABLE: tApiErrors("SERVICE_UNAVAILABLE"),
    SERVER_ERROR: tApiErrors("SERVER_ERROR"),
    NOT_FOUND: tApiErrors("NOT_FOUND"),
    IDEMPOTENCY_CONFLICT: tApiErrors("IDEMPOTENCY_CONFLICT"),
  };
}
