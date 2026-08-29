import type { CapacitorConfig } from "@capacitor/cli";
import { DEFAULT_PUBLIC_ORIGIN } from "./src/lib/site-url";

// Native app loads the current public web origin by default.
// Set CAPACITOR_SERVER_URL when the final custom domain is attached.
const serverUrl = process.env.CAPACITOR_SERVER_URL || DEFAULT_PUBLIC_ORIGIN;

const config: CapacitorConfig = {
  appId: "com.cypruswinter.app",
  appName: "Cyprus Winter",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: false,
    errorPath: "error.html",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
