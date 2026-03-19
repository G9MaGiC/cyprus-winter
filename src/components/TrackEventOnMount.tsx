"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { EventName } from "@/lib/analytics";

type TrackEventOnMountProps = {
  event: EventName;
  properties?: Record<string, string | number | boolean | undefined>;
};

export default function TrackEventOnMount({ event, properties }: TrackEventOnMountProps) {
  useEffect(() => {
    track(event, properties);
  }, [event, properties]);
  return null;
}

