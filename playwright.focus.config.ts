import { defineConfig, devices } from "@playwright/test";

// API はテスト内で固定レスポンスを返し、DB・Worker・認証情報を不要にする。
export default defineConfig({
  testDir: "./verification",
  testMatch: "focus.spec.ts",
  outputDir: "test-results/focus",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5174",
    trace: "retain-on-failure",
    viewport: { width: 393, height: 852 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter web exec vite --host localhost --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
  },
});
