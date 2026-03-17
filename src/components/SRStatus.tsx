"use client";

export function SRStatus({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
      {message}
    </div>
  );
}

