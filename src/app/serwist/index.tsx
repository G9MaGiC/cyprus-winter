"use client";

import { ReactNode } from "react";

interface SerwistProviderProps {
  swUrl: string;
  children: ReactNode;
}

export function SerwistProvider({ children }: SerwistProviderProps) {
  return <>{children}</>;
}
