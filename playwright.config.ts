import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: "apps/backend/.dev.vars" });
process.env.VERIFY_USER_EMAIL ??= "verification@example.test";
process.env.VERIFY_USER_PASSWORD ??= "verify-records-delete-password";

export default defineConfig({
  testDir: "./verification",
  testMatch: [
    "claim-create.spec.ts",
    "records-delete.spec.ts",
    "payment-create.spec.ts",
    "wallet-delete.spec.ts",
  ],
  outputDir: "test-results/playwright",
  reporter: [["list"], ["html", { open: "never" }]],
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 393, height: 852 },
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter backend exec wrangler dev --port 8787",
      name: "backend",
      url: "http://localhost:8787",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter web exec vite --host localhost --port 5173",
      name: "web",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
