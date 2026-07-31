import { defineConfig, devices } from "@playwright/test";

const SITE_PORT = 3200;
const API_PORT = 8181;
const API_URL = `http://127.0.0.1:${API_PORT}`;

/*
 * Two servers: the booking API harness (the real route handler with a recording
 * mailer, see server/tests/e2e-harness.mjs) and the site itself.
 *
 * The site is built here rather than reused, because NEXT_PUBLIC_API_BASE_URL
 * is inlined at build time and has to point at the harness.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: `http://127.0.0.1:${SITE_PORT}`,
    trace: "on-first-retry"
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],

  webServer: [
    {
      /* Built first: the harness mounts the compiled handler from server/dist. */
      command: `npm run build --prefix ../server && node ../server/tests/e2e-harness.mjs`,
      url: `${API_URL}/__outbox`,
      env: { PORT: String(API_PORT) },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    },
    {
      command: `npm run build && npm run start -- -p ${SITE_PORT}`,
      url: `http://127.0.0.1:${SITE_PORT}`,
      env: { NEXT_PUBLIC_API_BASE_URL: API_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
    }
  ]
});
