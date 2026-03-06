import type { Viewport } from "next";
import { TOKENS } from "@/lib/design-tokens";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: TOKENS.charcoal,
};
