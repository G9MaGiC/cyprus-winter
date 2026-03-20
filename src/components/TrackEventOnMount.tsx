"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import type { EventName } from "@/lib/analytics";

type TrackEventOnMountProps = {
  event: EventName;
  properties?: Record<string, string | number | boolean | undefined>;
};

export default function TrackEventOnMount({ event, properties }: TrackEventOnMountProps) {
  const hasFired = useRef(false);
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
