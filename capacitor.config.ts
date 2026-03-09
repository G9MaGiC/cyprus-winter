import type { CapacitorConfig } from "@capacitor/cli";

// Native app loads the web app from this URL. Use Vercel deployment for now; switch to production domain later.
const serverUrl =
  process.env.CAPACITOR_SERVER_URL || "https://cyprus-winter.vercel.app";

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
