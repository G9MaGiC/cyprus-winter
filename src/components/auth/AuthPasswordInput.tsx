"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type AuthPasswordInputProps = {
  id: string;
  label?: string;
  labelAside?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  showStrength?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: "current-password" | "new-password";
  "aria-describedby"?: string;
  confirmId?: string;
};

const inputBase =
  "w-full min-h-[48px] px-4 py-3 rounded-xl border border-sand-200/90 bg-white/95 text-charcoal placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/50 transition-colors duration-200";
const inputError = "border-terracotta/40 focus-visible:ring-terracotta/50";

function getStrengthKey(password: string): string | null {
  if (password.length === 0) return null;
  if (password.length < 6) return "tooShort";
  if (password.length >= 6 && password.length < 10) return "good";
  return "strong";
}

function getStrengthColor(password: string): string {
  if (password.length < 6) return "text-olive/60";
  if (password.length < 10) return "text-sage";
  return "text-sage font-medium";
}

export default function AuthPasswordInput({
  id,
  label,
  labelAside,
  value,
  onChange,
  placeholder = "••••••••",
  hint,
  showStrength = false,
  error,
  disabled,
  required,
  autoComplete = "current-password",
  "aria-describedby": ariaDescribedby,
}: AuthPasswordInputProps) {
  const tCommon = useTranslations("common");
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;
  const strengthKey = showStrength ? getStrengthKey(value) : null;
  const strengthLabel = strengthKey ? tCommon(`passwordStrength.${strengthKey}` as "passwordStrength.tooShort" | "passwordStrength.good" | "passwordStrength.strong") : null;
  const strengthColor = showStrength ? getStrengthColor(value) : "";

  const describedBy = [hint && `${id}-hint`, strengthLabel && `${id}-strength`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ") || ariaDescribedby || undefined;

  return (
    <div>
      {(label ?? labelAside) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-olive">
              {label}
            </label>
          )}
          {labelAside}
        </div>
      )}
      {(hint || strengthLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          {hint && (
            <p id={`${id}-hint`} className="text-xs text-olive/60">
              {hint}
            </p>
          )}
          {showStrength && strengthLabel && (
            <p
              id={`${id}-strength`}
              className={`text-xs ${strengthColor}`}
              aria-live="polite"
            >
              {strengthLabel}
            </p>
          )}
        </div>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          minLength={showStrength ? 6 : undefined}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          aria-errormessage={hasError ? `${id}-error` : undefined}
          className={`${inputBase} pr-12 ${hasError ? inputError : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-olive/60 hover:text-olive transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
          aria-label={showPassword ? tCommon("hidePassword") : tCommon("showPassword")}
          tabIndex={-1}
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-terracotta"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
