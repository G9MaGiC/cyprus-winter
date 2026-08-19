"use client";

import { useState, useRef, useEffect, useCallback, type RefObject } from "react";
import type { z } from "zod";
import { track } from "@/lib/analytics";
import { addBookingToLocal } from "@/lib/bookings-storage";
import { addMutation } from "@/lib/offline-queue";
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
  validateFieldOnBlur: (name: string, value: string) => void;
};

type ErrorStrings = {
  failed: string;
  fallback: string;
  offlineQueued: string;
};

export function useBookingForm(
  config: BookingFormConfig,
  tErrors: ErrorStrings
): BookingFormState {
  const { type, providerId, schema, extraFields, validationLabels } = config;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [storageMode, setStorageMode] = useState<"database" | "memory" | null>(null);
  const [emailDelayed, setEmailDelayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notesLength, setNotesLength] = useState(0);
  const [todayStr, setTodayStr] = useState("");
  const idempotencyKeyRef = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setTodayStr(toLocalDateInputValue());
  }, []);

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
    };

    if (extraFields) {
      for (const key of Object.keys(extraFields)) {
        if (validated[key]) bodyObj[key] = validated[key];
      }
    }

    const body = JSON.stringify(bodyObj);
    const mutationType = type === "winery_tasting" ? "winery_booking" : "guide_booking";

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.message ??
          (typeof data.error === "string" ? data.error : data.error?.message) ??
          tErrors.failed;
        throw new Error(msg);
      }

      setDone(true);
      setStorageMode(data.storage ?? null);
      setEmailDelayed(data.emailStatus?.confirmationSent === false);
      form.reset();

      // booking_complete is recorded by the server after durable creation,
      // so clients cannot forge conversion funnel data.
      addBookingToLocal(data.booking);
      idempotencyKeyRef.current = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|network error/i.test(msg);
      if (isNetworkError && typeof navigator !== "undefined") {
        addMutation({ type: mutationType, url: "/api/bookings", method: "POST", body });
        setError(tErrors.offlineQueued);
      } else {
        idempotencyKeyRef.current = null;
        setError(msg || tErrors.fallback);
      }
      setTimeout(() => {
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
    validateFieldOnBlur,
  };
}
