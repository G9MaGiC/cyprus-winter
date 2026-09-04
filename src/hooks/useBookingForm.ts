"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import { useLocale } from "next-intl";
import type { z } from "zod";
import { track } from "@/lib/analytics";
import { addBookingToLocal } from "@/lib/bookings-storage";
import {
  addMutation,
  OFFLINE_QUEUE_DRAINED_EVENT,
  OFFLINE_QUEUE_DROPPED_EVENT,
} from "@/lib/offline-queue";
import {
  formatZodErrors,
  localizeBookingFieldErrors,
  toLocalDateInputValue,
  type BookingValidationLabels,
} from "@/lib/booking-schemas";

export type BookingFormConfig = {
  type: "winery_tasting" | "guide_tour";
  providerId: string;
  providerName: string;
  schema: z.ZodSchema;
  extraFields?: Record<string, string | undefined>;
  analyticsExtra?: Record<string, string | number | undefined>;
  validationLabels?: BookingValidationLabels;
};

export type BookingFormState = {
  loading: boolean;
  done: boolean;
  storageMode: "database" | "memory" | null;
  emailDelayed: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  notesLength: number;
  setNotesLength: (n: number) => void;
  successRef: RefObject<HTMLDivElement | null>;
  errorRef: RefObject<HTMLParagraphElement | null>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  todayStr: string;
  /** Seconds left of a server-imposed rate-limit lockout (0 = none). */
  retryAfterSeconds: number;
  validateFieldOnBlur: (name: string, value: string) => void;
};

type ErrorStrings = {
  failed: string;
  fallback: string;
  offlineQueued: string;
  /** Shown when the queued request was permanently rejected on drain (AUD-21). */
  offlineDropped: string;
  /** Localized messages by API error code — the server's own message is EN-only (BUG: raw EN in all locales). */
  apiByCode?: Record<string, string>;
  /** Inline marker for a field the server named in a VALIDATION_ERROR (AUD-80 residual). */
  serverField?: string;
};

export function useBookingForm(
  config: BookingFormConfig,
  tErrors: ErrorStrings
): BookingFormState {
  const { type, providerId, schema, extraFields, validationLabels } = config;

  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [storageMode, setStorageMode] = useState<"database" | "memory" | null>(null);
  const [emailDelayed, setEmailDelayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notesLength, setNotesLength] = useState(0);
  const [todayStr, setTodayStr] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const idempotencyKeyRef = useRef<string | null>(null);
  const queuedOfflineRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Both drain listeners scope to this form's own queue type — a drain can
  // deliver a trail report while rejecting this booking (or vice versa), and
  // the coarse queue-level signal would tell the wrong story.
  const queueMutationType = type === "winery_tasting" ? "winery_booking" : "guide_booking";
  const eventTouchesThisForm = (e: Event): boolean => {
    const types = (e as CustomEvent<{ types?: string[] }>).detail?.types;
    return !Array.isArray(types) || types.includes(queueMutationType);
  };

  // When the offline queue drains, THIS form's queued request was delivered
  // (and stored locally by the drain) — swap the stale "will be sent" message
  // for the real success state (AUD B2-06 residual).
  useEffect(() => {
    const onDrained = (e: Event) => {
      if (!queuedOfflineRef.current || !eventTouchesThisForm(e)) return;
      queuedOfflineRef.current = false;
      idempotencyKeyRef.current = null;
      setError(null);
      setDone(true);
    };
    window.addEventListener(OFFLINE_QUEUE_DRAINED_EVENT, onDrained);
    return () => window.removeEventListener(OFFLINE_QUEUE_DRAINED_EVENT, onDrained);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueMutationType]);

  // The drain permanently rejected queued work of this form's type
  // (non-retryable 4xx) — surface the failure instead of the stale offline
  // promise (AUD-21). Fires before DRAINED so on a mixed drain the failure
  // wins the queued flag. Reset the idempotency key so a corrected
  // resubmission is a fresh request, not a payload-mismatch conflict.
  useEffect(() => {
    const onDropped = (e: Event) => {
      if (!queuedOfflineRef.current || !eventTouchesThisForm(e)) return;
      queuedOfflineRef.current = false;
      idempotencyKeyRef.current = null;
      setDone(false);
      setError(tErrors.offlineDropped);
    };
    window.addEventListener(OFFLINE_QUEUE_DROPPED_EVENT, onDropped);
    return () => window.removeEventListener(OFFLINE_QUEUE_DROPPED_EVENT, onDropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tErrors.offlineDropped, queueMutationType]);

  useEffect(() => {
    setTodayStr(toLocalDateInputValue());
  }, []);

  // Count the rate-limit lockout down so the UI can show a real number and
  // re-enable submit when the window has actually passed (AUD B2-07).
  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = setTimeout(() => setRetryAfterSeconds((s) => (s > 1 ? s - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [retryAfterSeconds]);

  const toFieldErrors = useCallback(
    (raw: Record<string, string>) =>
      validationLabels ? localizeBookingFieldErrors(raw, validationLabels) : raw,
    [validationLabels]
  );

  useEffect(() => {
    if (done && successRef.current) {
      successRef.current.focus({ preventScroll: false });
    }
  }, [done]);

  useEffect(() => {
    track("booking_trust_strip_view", { type, [`${type === "winery_tasting" ? "winery" : "guide"}Id`]: providerId });
    track("booking_stepper_progress", { type, step: 1 });
  }, [type, providerId]);

  useEffect(() => {
    if (!done) return;
    track("booking_stepper_progress", { type, step: 3 });
  }, [done, type]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    const rawInput: Record<string, string | undefined> = {
      date: formData.get("date") as string,
      partySize: formData.get("partySize") as string,
      guestName: formData.get("guestName") as string,
      guestEmail: formData.get("guestEmail") as string,
      notes: formData.get("notes") as string,
    };

    if (extraFields) {
      for (const [key, fallback] of Object.entries(extraFields)) {
        rawInput[key] = (formData.get(key) as string) || fallback;
      }
    }

    const validation = schema.safeParse(rawInput);
    if (!validation.success) {
      setFieldErrors(toFieldErrors(formatZodErrors(validation as { success: false; error: import("zod").ZodError })));
      return;
    }

    setLoading(true);
    const validated = validation.data as Record<string, unknown>;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `booking-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
    }

    const bodyObj: Record<string, unknown> = {
      type,
      providerId,
      idempotencyKey: idempotencyKeyRef.current,
      date: validated.date,
      partySize: validated.partySize,
      guestName: validated.guestName,
      guestEmail: validated.guestEmail,
      notes: validated.notes || undefined,
      locale,
    };

    // Honeypot passthrough: empty for humans (field is off-screen and out of
    // the tab order); a bot auto-filling the DOM form trips the API's check.
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.trim()) {
      bodyObj.website = honeypot;
    }

    if (extraFields) {
      for (const key of Object.keys(extraFields)) {
        if (validated[key]) bodyObj[key] = validated[key];
      }
    }

    const body = JSON.stringify(bodyObj);
    const mutationType = queueMutationType;

    // Field the server named in a VALIDATION_ERROR detail, if it maps to an
    // input this form actually renders — lets the catch path mark and focus
    // the field itself instead of only the banner (AUD-80 residual).
    let serverInvalidField: string | null = null;
    const knownFields = new Set([
      "date",
      "partySize",
      "guestName",
      "guestEmail",
      "notes",
      ...(extraFields ? Object.keys(extraFields) : []),
    ]);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const ra = Number(res.headers.get("retry-after"));
          if (Number.isFinite(ra) && ra > 0) setRetryAfterSeconds(Math.ceil(ra));
        }
        const code =
          typeof data.error === "object" && data.error !== null
            ? (data.error.code as string | undefined)
            : undefined;
        if (code === "VALIDATION_ERROR") {
          const details = (data.error as { details?: unknown }).details;
          const first = Array.isArray(details) ? details[0] : undefined;
          const field =
            first && typeof first === "object" && typeof (first as { field?: unknown }).field === "string"
              ? (first as { field: string }).field
              : undefined;
          if (field && knownFields.has(field)) serverInvalidField = field;
        }
        // Never surface the server's message text: it is English-only, so any
        // unmapped code must fall back to the localized generic instead.
        const msg = (code ? tErrors.apiByCode?.[code] : undefined) ?? tErrors.failed;
        throw new Error(msg);
      }

      // The honeypot path answers 200 with stored:false and no booking —
      // showing the success screen would tell a real user (autofilled hidden
      // field) their request was saved when nothing was stored anywhere.
      if (data.stored === false) {
        idempotencyKeyRef.current = null;
        throw new Error(tErrors.failed);
      }

      setDone(true);
      setStorageMode(data.storage ?? null);
      setEmailDelayed(data.emailStatus?.confirmationSent === false);
      form.reset();

      // booking_complete is recorded by the server after durable creation,
      // so clients cannot forge conversion funnel data.
      if (data.booking) {
        addBookingToLocal(data.booking);
      }
      idempotencyKeyRef.current = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|network error/i.test(msg);
      if (isNetworkError && typeof navigator !== "undefined") {
        addMutation({ type: mutationType, url: "/api/bookings", method: "POST", body });
        queuedOfflineRef.current = true;
        setError(tErrors.offlineQueued);
      } else {
        idempotencyKeyRef.current = null;
        setError(msg || tErrors.fallback);
        if (serverInvalidField) {
          setFieldErrors({ [serverInvalidField]: tErrors.serverField ?? tErrors.failed });
        }
      }
      setTimeout(() => {
        // A field the server named gets focus itself (its inline error and
        // aria-invalid render alongside); otherwise scroll to the banner.
        if (serverInvalidField) {
          const el = form.elements.namedItem(serverInvalidField);
          if (el instanceof HTMLElement) {
            el.focus();
            return;
          }
        }
        const behavior =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth";
        errorRef.current?.scrollIntoView({ behavior, block: "nearest" });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const validateFieldOnBlur = useCallback(
    (name: string, value: string) => {
      const partial: Record<string, string> = { [name]: value };
      const result = schema.safeParse({
        date: "2099-01-01",
        partySize: "2",
        guestName: "x",
        guestEmail: "x@x.com",
        notes: "",
        ...partial,
      });
      if (!result.success) {
        const errs = toFieldErrors(formatZodErrors(result as { success: false; error: z.ZodError }));
        if (errs[name]) {
          setFieldErrors((prev) => ({ ...prev, [name]: errs[name] }));
        } else {
          setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        }
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [schema, toFieldErrors]
  );

  return {
    loading,
    done,
    storageMode,
    emailDelayed,
    error,
    fieldErrors,
    notesLength,
    setNotesLength,
    successRef,
    errorRef,
    handleSubmit,
    todayStr,
    retryAfterSeconds,
    validateFieldOnBlur,
  };
}
