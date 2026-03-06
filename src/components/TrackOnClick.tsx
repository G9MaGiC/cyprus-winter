"use client";

import { track } from "@/lib/analytics";
import type { EventName } from "@/lib/analytics";

type TrackOnClickProps = {
  event: EventName;
  properties?: Record<string, string | number | boolean | undefined>;
  children: React.ReactNode;
  as?: "span" | "div";
};

export function TrackOnClick({
  event,
  properties,
  children,
  as: As = "span",
}: TrackOnClickProps) {
  return (
    <As
      onClick={() => track(event, properties)}
      style={{ display: "contents" }}
    >
      {children}
    </As>
  );
}
