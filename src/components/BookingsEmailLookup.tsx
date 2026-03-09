"use client";

type Props = {
  email: string;
  onEmailChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  layout?: "inline" | "stacked";
  /** When set and error is shown, displays a Try again button that calls this (e.g. clear error so user can resubmit). */
  onRetry?: () => void;
};

export default function BookingsEmailLookup({
  email,
  onEmailChange,
  loading,
  error,
  success,
  onSubmit,
  submitLabel = "Load bookings",
  layout = "inline",
  onRetry,
}: Props) {
  const inputClasses =
    "flex-1 min-w-0 min-h-[44px] rounded-lg border border-sand-200/80 px-4 py-2.5 text-sm text-olive placeholder:text-olive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/50 disabled:opacity-50";
  const buttonClasses =
    "inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const isStacked = layout === "stacked";

  return (
    <form onSubmit={onSubmit} className={isStacked ? "w-full max-w-sm mx-auto" : ""}>
      <div className={`flex flex-col gap-3 ${isStacked ? "w-full" : "sm:flex-row"}`}>
        <label htmlFor="bookings-email-lookup" className="sr-only">
          Your email to load bookings from another device
        </label>
        <input
          id="bookings-email-lookup"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? "bookings-email-error" : success ? "bookings-email-success" : undefined}
        />
        <button type="submit" disabled={loading} className={`${buttonClasses} ${isStacked ? "w-full" : ""}`}>
          {loading ? "Loading…" : submitLabel}
        </button>
      </div>
      {(error || success) && (
        <div className="mt-3">
          <p
            id={error ? "bookings-email-error" : "bookings-email-success"}
            className={`text-sm break-words ${error ? "text-terracotta" : "text-aegean"}`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            {error ?? success}
          </p>
          {error && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-terracotta hover:bg-terracotta/10 border border-terracotta/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </form>
  );
}
