import type { Config } from "tailwindcss";

/*
 * The old site pulled Tailwind 2.2.19 off a CDN and used stock utilities only.
 * This config keeps the default palette and scale untouched so every class that
 * was in index.html renders the same; the one addition is `brand`, which names
 * the two hex values that were previously hard-coded as inline styles on the
 * booking buttons.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00b9ff",
          dark: "#009ed9"
        }
      }
    }
  },
  plugins: []
};

export default config;
