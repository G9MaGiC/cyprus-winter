import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Capacitor-generated Android files
    "android/**",
    // Playwright output (generated artifacts)
    "playwright-report/**",
    "test-results/**",
    // Local nested clone used for experiments; not part of this app.
    "cyprus-winter-clone/**",
  ]),
]);

export default eslintConfig;
