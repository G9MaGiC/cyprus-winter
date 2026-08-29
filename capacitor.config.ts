import type { CapacitorConfig } from "@capacitor/cli";

// Native app loads the current public Vercel production alias by default.
// Set CAPACITOR_SERVER_URL when the final custom domain is attached.
const serverUrl =
  process.env.CAPACITOR_SERVER_URL || "https://cyprus-winter-three.vercel.app";

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
