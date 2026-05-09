"use client";

import React from "react";
import { track } from "@/lib/analytics";
import type { EventName } from "@/lib/analytics";

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
        if (!e.defaultPrevented) track(event, properties);
      },
    });
  }

  return (
    <span
      onClick={() => track(event, properties)}
      className="contents"
    >
      {children}
    </span>
  );
}
