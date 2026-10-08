import { defineConfig, devices } from "@playwright/test";

// API はテスト内で固定レスポンスを返し、DB・Worker・認証情報を不要にする。
export default defineConfig({
  testDir: "./verification",
  testMatch: "server-state.spec.ts",
  outputDir: "test-results/server-state",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    viewport: { width: 393, height: 852 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter web exec vite --host localhost --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
