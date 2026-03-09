"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";

const AIAssistant = dynamic(() => import("@/components/AIAssistant"), { loading: () => null });

type Props = { children?: ReactNode };

type State = { hasError: boolean };

/** Error boundary around AIAssistant so a crash does not break the rest of the app. */
class AIAssistantErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("AIAssistant error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children ?? <AIAssistant />;
  }
}

export default function AIAssistantWithBoundary() {
  return (
    <AIAssistantErrorBoundary>
      <AIAssistant />
    </AIAssistantErrorBoundary>
  );
}
