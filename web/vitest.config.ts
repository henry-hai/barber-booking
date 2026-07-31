import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      /* next/font is a build-time transform, so outside the Next compiler the
         import is not callable and any component using a typeface throws on
         load. See tests/mocks/next-font.ts. */
      "next/font/google": path.resolve(__dirname, "tests/mocks/next-font.ts")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    /* Playwright owns tests/e2e; vitest must not try to run those. */
    include: ["tests/unit/**/*.test.{ts,tsx}"]
  }
});
