"use client";

import { ReactNode, useSyncExternalStore } from "react";

interface SerwistProviderProps {
  swUrl: string;
  children: ReactNode;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function SerwistProvider({ children }: SerwistProviderProps) {
  // Use useSyncExternalStore to avoid setState in useEffect warning
  const isReady = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
