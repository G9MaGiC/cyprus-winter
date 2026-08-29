"use client";

import { forwardRef } from "react";

export type AuthInputProps = {
  id: string;
  label: string;
  type?: "text" | "email";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoCapitalize?: "none" | "sentences";
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-errormessage"?: string;
};

const inputBase =
  "w-full min-h-[48px] px-4 py-3 rounded-xl border border-sand-200/90 bg-white/95 text-charcoal placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/50 transition-colors duration-200";
const inputError = "border-terracotta/40 focus-visible:ring-terracotta/50";

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      id,
      label,
      type = "text",
      value,
      onChange,
      placeholder,
      hint,
      error,
      disabled,
      required,
      autoComplete,
      autoCapitalize,
      "aria-describedby": ariaDescribedby,
      "aria-invalid": ariaInvalid,
      "aria-errormessage": ariaErrormessage,
    },
    ref
  ) => {
    const hasError = !!error;
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || ariaDescribedby || undefined;

    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-olive mb-2"
        >
          {label}
        </label>
        {hint && (
          <p
            id={`${id}-hint`}
            className="text-xs text-muted-ink mb-1.5"
          >
            {hint}
          </p>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          aria-describedby={describedBy}
          aria-invalid={hasError || ariaInvalid}
          aria-errormessage={hasError ? `${id}-error` : ariaErrormessage}
          className={`${inputBase} ${hasError ? inputError : ""}`}
        />
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
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
