"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Lightweight error boundary for map components.
 * Maps depend on Leaflet + tile servers, so they're the most likely
 * components to fail at runtime. This prevents a map crash from
 * taking down the whole page.
 */
export default class MapErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] rounded-xl border border-sand-200/80 bg-sand-100/80 flex items-center justify-center">
          <p className="text-sm text-olive/60">
            Map unavailable — try refreshing the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
