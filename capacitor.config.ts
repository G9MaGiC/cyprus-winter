import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cypruswinter.app",
  appName: "Cyprus Winter",
  webDir: "public",
  server: {
    url: "https://cypruswinter.com",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
