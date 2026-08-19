"use client";

import React from "react";
import { track, trackProduct } from "@/lib/analytics";
import type { EventName } from "@/lib/analytics";
import { isProductEvent } from "@/lib/track-events";

type TrackOnClickProps = {
  event: EventName;
  properties?: Record<string, string | number | boolean | undefined>;
  children: React.ReactNode;
};

export function TrackOnClick({
  event,
  properties,
  children,
}: TrackOnClickProps) {
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: React.MouseEventHandler;
    }>;

    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        if (!e.defaultPrevented) {
          if (isProductEvent(event)) trackProduct(event, properties);
          else track(event, properties);
        }
      },
    });
  }

  return (
    <span
      onClick={() => {
        if (isProductEvent(event)) trackProduct(event, properties);
        else track(event, properties);
      }}
      className="contents"
    >
      {children}
    </span>
  );
}
