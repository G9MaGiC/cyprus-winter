"use client";

import { SerwistProvider as SerwistReactProvider } from "@serwist/next/react";
import { ReactNode } from "react";

interface SerwistProviderProps {
  swUrl?: string;
  children: ReactNode;
}

export function SerwistProvider({ children }: SerwistProviderProps) {
  return (
    <SerwistReactProvider swUrl="/sw.js">
      {children}
    </SerwistReactProvider>
  );
}
